const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../libs/db");

const PRODUCT_ADVISOR_LIMIT = 18;
const PRODUCT_ADVISOR_HISTORY_LIMIT = 8;

function stripMarkdownFence(text) {
  const raw = String(text || "").trim();
  if (!raw.startsWith("```")) return raw;
  return raw.replace(/^```[a-zA-Z]*\s*/, "").replace(/```\s*$/, "").trim();
}

function tryParseJson(text) {
  const cleaned = stripMarkdownFence(text);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function getOptionalAuthenticatedUser(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

function truncateText(value, maxLength = 220) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength - 1).trim()}...`
    : normalized;
}

function normalizeCustomPrompt(value) {
  return truncateText(value, 280);
}

async function ensureAdvisorHistoryTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = 'UserPlantAdvisorHistory'
    )
    BEGIN
      CREATE TABLE UserPlantAdvisorHistory (
        id                   INT IDENTITY(1,1) PRIMARY KEY,
        user_id              INT NOT NULL REFERENCES Users(id),
        budget               DECIMAL(18, 2) NOT NULL,
        light_level          NVARCHAR(20) NOT NULL,
        has_pets             BIT NOT NULL DEFAULT 0,
        priority             NVARCHAR(50) NOT NULL,
        custom_prompt        NVARCHAR(280) NULL,
        summary              NVARCHAR(MAX),
        recommendations_json NVARCHAR(MAX) NOT NULL,
        created_at           DATETIME NOT NULL DEFAULT GETDATE()
      );

      CREATE INDEX IX_UserPlantAdvisorHistory_UserId_CreatedAt
        ON UserPlantAdvisorHistory(user_id, created_at DESC);
    END
  `);

  await pool.request().query(`
    IF COL_LENGTH('UserPlantAdvisorHistory', 'custom_prompt') IS NULL
    BEGIN
      ALTER TABLE UserPlantAdvisorHistory
      ADD custom_prompt NVARCHAR(280) NULL;
    END
  `);
}

function buildAdvisorShortlist(products, budget) {
  const budgetValue = Number(budget) || 0;
  const withinBudget = products.filter((product) => Number(product.price) <= budgetValue * 1.15);
  const nearbyProducts = withinBudget.length >= 10
    ? withinBudget
    : products.filter((product) => Number(product.price) <= budgetValue * 1.35);
  const source = nearbyProducts.length >= 8 ? nearbyProducts : products;
  return source.slice(0, PRODUCT_ADVISOR_LIMIT);
}

function summarizeProductForAdvisor(product) {
  return {
    id: Number(product.id),
    title: String(product.title || "").trim(),
    price: Number(product.price || 0),
    category: String(product.category || "").trim(),
    description: truncateText(product.description, 220),
    bio: truncateText(product.bio, 180),
    careGuides: Array.isArray(product.careGuide)
      ? product.careGuide.slice(0, 3).map((guide) => ({
          title: truncateText(guide.title, 80),
          content: truncateText(guide.content, 200),
        }))
      : [],
  };
}

function buildFallbackFitTags(product, preferences) {
  const tags = [];
  if (Number(product.price) <= preferences.budget) {
    tags.push("Trong ngân sách");
  } else if (Number(product.price) <= preferences.budget * 1.15) {
    tags.push("Vượt nhẹ ngân sách");
  }

  if (preferences.priority === "easy-care") {
    tags.push("Ưu tiên dễ chăm");
  } else {
    tags.push("Ưu tiên decor");
  }

  if (preferences.lightLevel === "low") {
    tags.push("Ánh sáng thấp");
  } else if (preferences.lightLevel === "medium") {
    tags.push("Ánh sáng vừa");
  } else {
    tags.push("Ánh sáng mạnh");
  }

  if (preferences.hasPets) {
    tags.push("Cần kiểm tra thêm với thú cưng");
  }

  return tags.slice(0, 3);
}

function buildFallbackReason(product, preferences) {
  const fragments = [
    `Mức giá ${Number(product.price || 0).toLocaleString("vi-VN")}đ khá sát nhu cầu ngân sách của bạn.`,
  ];

  if (preferences.priority === "easy-care") {
    fragments.push(
      Array.isArray(product.careGuide) && product.careGuide.length > 0
        ? "Sản phẩm có sẵn hướng dẫn chăm sóc để bạn bắt đầu dễ hơn."
        : "Phần mô tả và thông tin sản phẩm đủ để bạn cân nhắc theo hướng dễ chăm."
    );
  } else {
    fragments.push("Dáng cây và nhóm sản phẩm này phù hợp để ưu tiên tính thẩm mỹ và decor không gian.");
  }

  if (preferences.hasPets) {
    fragments.push("Nếu nhà có thú cưng, bạn vẫn nên đọc kỹ mô tả sản phẩm trước khi đặt ở khu vực thú cưng dễ tiếp cận.");
  }

  return fragments.join(" ");
}

function buildFallbackAdvisorResponse(products, preferences) {
  const recommendations = products.slice(0, 4).map((product) => ({
    product,
    reason: buildFallbackReason(product, preferences),
    fitTags: buildFallbackFitTags(product, preferences),
  }));

  return {
    summary: preferences.priority === "easy-care"
      ? "Đây là nhóm cây được lọc theo ngân sách và ưu tiên dễ chăm để bạn bắt đầu nhanh hơn."
      : "Đây là nhóm cây được lọc theo ngân sách và ưu tiên decor để bạn tham khảo nhanh.",
    recommendations,
  };
}

function normalizeHistoryRecommendations(recommendations, productMap) {
  const source = Array.isArray(recommendations) ? recommendations : [];
  const seen = new Set();

  return source
    .map((entry) => {
      const productId = Number(entry?.id ?? entry?.productId ?? entry?.product?.id);
      const product = productMap.get(productId);
      if (!product || seen.has(productId)) return null;
      seen.add(productId);

      return {
        product,
        reason: truncateText(entry?.reason, 280),
        fitTags: Array.isArray(entry?.fitTags)
          ? entry.fitTags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4)
          : [],
      };
    })
    .filter(Boolean)
    .slice(0, 5);
}

function normalizeAdvisorOutput(payload, productMap) {
  const rawRecommendations = Array.isArray(payload?.recommendations)
    ? payload.recommendations
    : [];

  return {
    summary: truncateText(payload?.summary, 320),
    recommendations: normalizeHistoryRecommendations(rawRecommendations, productMap),
  };
}

async function saveAdvisorHistory(pool, userId, preferences, advisorResult) {
  await ensureAdvisorHistoryTable(pool);

  const historyPayload = advisorResult.recommendations.map((entry) => ({
    id: Number(entry.product.id),
    reason: truncateText(entry.reason, 280),
    fitTags: Array.isArray(entry.fitTags)
      ? entry.fitTags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 4)
      : [],
  }));

  await pool
    .request()
    .input("userId", sql.Int, userId)
    .input("budget", sql.Decimal(18, 2), preferences.budget)
    .input("lightLevel", sql.NVarChar, preferences.lightLevel)
    .input("hasPets", sql.Bit, preferences.hasPets)
    .input("priority", sql.NVarChar, preferences.priority)
    .input("customPrompt", sql.NVarChar(280), normalizeCustomPrompt(preferences.customPrompt) || null)
    .input("summary", sql.NVarChar, advisorResult.summary || null)
    .input("recommendationsJson", sql.NVarChar, JSON.stringify(historyPayload))
    .query(
      `INSERT INTO UserPlantAdvisorHistory (
         user_id, budget, light_level, has_pets, priority, custom_prompt, summary, recommendations_json
       )
       VALUES (
         @userId, @budget, @lightLevel, @hasPets, @priority, @customPrompt, @summary, @recommendationsJson
       )`
    );
}

async function fetchProductsByIds(pool, ids) {
  if (!ids.length) return [];

  const uniqueIds = [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
  if (!uniqueIds.length) return [];

  const result = await pool
    .request()
    .query(
      `SELECT p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
              p.description, p.image_url AS imageUrl, c.name AS category,
              p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
       FROM Products p
       LEFT JOIN Categories c ON p.category_id = c.id
       WHERE p.id IN (${uniqueIds.join(",")})`
    );

  return enrichProducts(pool, result.recordset);
}

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      page = 1,
      pageSize = 9,
      sort,
      saleOnly,
    } = req.query;
    const pool = await getPool();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (category) {
      request.input("category", sql.NVarChar, category);
      where += " AND c.name = @category";
    }
    if (search) {
      request.input("search", sql.NVarChar, `%${search}%`);
      where += " AND (p.title LIKE @search OR c.name LIKE @search)";
    }
    if (minPrice) {
      request.input("minPrice", sql.Decimal(18, 2), parseFloat(minPrice));
      where += " AND p.price >= @minPrice";
    }
    if (maxPrice) {
      request.input("maxPrice", sql.Decimal(18, 2), parseFloat(maxPrice));
      where += " AND p.price <= @maxPrice";
    }
    if (String(saleOnly).toLowerCase() === "true") {
      where += " AND p.discount IS NOT NULL AND LTRIM(RTRIM(p.discount)) <> ''";
    }

    const normalizedSort = normalizeProductSort(sort);
    const orderBy = buildProductOrderBy(normalizedSort);

    const countResult = await request.query(
      `SELECT COUNT(*) AS total FROM Products p
       LEFT JOIN Categories c ON p.category_id = c.id ${where}`
    );
    const total = countResult.recordset[0].total;

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    request.input("offset", sql.Int, offset);
    request.input("pageSize", sql.Int, parseInt(pageSize));

    const result = await request.query(
      `SELECT p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
              p.description, p.image_url AS imageUrl, c.name AS category,
              p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions,
              ISNULL(sales.totalSold, 0) AS totalSold,
              ISNULL(reviews.reviewCount, 0) AS reviewCount
       FROM Products p
       LEFT JOIN Categories c ON p.category_id = c.id
       LEFT JOIN (
         SELECT oi.product_id, SUM(oi.quantity) AS totalSold
         FROM OrderItems oi
         INNER JOIN Orders o ON o.id = oi.order_id
         WHERE oi.product_id IS NOT NULL AND o.status NOT IN ('cancelled', 'returning')
         GROUP BY oi.product_id
       ) sales ON sales.product_id = p.id
       LEFT JOIN (
         SELECT r.product_id, COUNT(*) AS reviewCount
         FROM Reviews r
         WHERE r.visible = 1
         GROUP BY r.product_id
       ) reviews ON reviews.product_id = p.id
       ${where}
       ORDER BY ${orderBy}
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
    );

    const products = await enrichProducts(pool, result.recordset);
    return res.json({ products, total });
  } catch (err) {
    next(err);
  }
}

function normalizeProductSort(sort) {
  const value = String(sort || "").trim().toLowerCase();
  if (value === "sale") return "sale";
  if (value === "trending") return "trending";
  if (value === "best-selling") return "best-selling";
  if (value === "price-asc") return "price-asc";
  if (value === "price-desc") return "price-desc";
  return "default";
}

function buildProductOrderBy(sort) {
  switch (sort) {
    case "sale":
      return `CASE WHEN p.discount IS NULL OR LTRIM(RTRIM(p.discount)) = '' THEN 1 ELSE 0 END,
              TRY_CAST(REPLACE(REPLACE(p.discount, '%', ''), ' ', '') AS INT) DESC,
              p.id DESC`;
    case "trending":
      return `ISNULL(sales.totalSold, 0) DESC,
              ISNULL(reviews.reviewCount, 0) DESC,
              CASE WHEN p.discount IS NULL OR LTRIM(RTRIM(p.discount)) = '' THEN 1 ELSE 0 END,
              p.id DESC`;
    case "best-selling":
      return `ISNULL(sales.totalSold, 0) DESC,
              CASE WHEN p.discount IS NULL OR LTRIM(RTRIM(p.discount)) = '' THEN 1 ELSE 0 END,
              TRY_CAST(REPLACE(REPLACE(p.discount, '%', ''), ' ', '') AS INT) DESC,
              p.id DESC`;
    case "price-asc":
      return "p.price ASC, p.id DESC";
    case "price-desc":
      return "p.price DESC, p.id DESC";
    default:
      return "p.id DESC";
  }
}

// GET /api/products/search
async function searchProducts(req, res, next) {
  try {
    const { q = "", limit = 5 } = req.query;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("q", sql.NVarChar, `%${q}%`)
      .input("limit", sql.Int, parseInt(limit))
      .query(
        `SELECT TOP (@limit) p.id, p.title, c.name AS category
         FROM Products p
         LEFT JOIN Categories c ON p.category_id = c.id
         WHERE p.title LIKE @q OR c.name LIKE @q
         ORDER BY p.id`
      );
    return res.json(result.recordset);
  } catch (err) {
    next(err);
  }
}

// POST /api/products/advisor
async function getProductAdvisorRecommendations(req, res, next) {
  try {
    const budget = Number(req.body?.budget);
    const lightLevel = String(req.body?.lightLevel || "").trim().toLowerCase();
    const priority = String(req.body?.priority || "").trim().toLowerCase();
    const hasPets = req.body?.hasPets === true;
    const customPrompt = normalizeCustomPrompt(req.body?.customPrompt);

    if (!Number.isFinite(budget) || budget <= 0) {
      return res.status(400).json({ message: "Ngân sách cần là số lớn hơn 0." });
    }
    if (!["low", "medium", "bright"].includes(lightLevel)) {
      return res.status(400).json({ message: "Mức ánh sáng không hợp lệ." });
    }
    if (!["easy-care", "decor"].includes(priority)) {
      return res.status(400).json({ message: "Mục tiêu chọn cây không hợp lệ." });
    }

    const pool = await getPool();
    const query = await pool
      .request()
      .input("budget", sql.Decimal(18, 2), budget)
      .query(
        `SELECT TOP (40)
                p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
                p.description, p.image_url AS imageUrl, c.name AS category,
                p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
         FROM Products p
         LEFT JOIN Categories c ON p.category_id = c.id
         WHERE p.in_stock = 1
         ORDER BY CASE WHEN p.price <= @budget THEN 0 ELSE 1 END,
                  ABS(p.price - @budget),
                  p.id DESC`
      );

    const allProducts = await enrichProducts(pool, query.recordset);
    const shortlist = buildAdvisorShortlist(allProducts, budget);

    if (shortlist.length === 0) {
      return res.status(404).json({ message: "Hiện chưa có sản phẩm phù hợp để tư vấn." });
    }

    const preferences = { budget, lightLevel, hasPets, priority, customPrompt };
    const productMap = new Map(shortlist.map((product) => [Number(product.id), product]));
    const authenticatedUser = getOptionalAuthenticatedUser(req);

    const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(400).json({ message: "Chưa cấu hình OPENROUTER_API_KEY trên server." });
    }

    const model = String(
      process.env.OPENROUTER_PRODUCT_ADVISOR_MODEL ||
      process.env.OPENROUTER_MODEL ||
      "deepseek/deepseek-chat-v3-0324:free"
    ).trim();
    const siteUrl = String(process.env.OPENROUTER_SITE_URL || "http://localhost:5173").trim();
    const appName = String(process.env.OPENROUTER_APP_NAME || "PlantWeb Shop").trim();

    const lightLabels = {
      low: "ít sáng, gần cửa sổ nhỏ hoặc trong phòng",
      medium: "ánh sáng gián tiếp vừa phải",
      bright: "nơi sáng mạnh hoặc gần cửa sổ nhiều sáng",
    };

    const systemPrompt = [
      "Bạn là chuyên gia tư vấn chọn cây cho web bán cây cảnh tại Việt Nam.",
      "Chỉ được chọn sản phẩm từ catalog đã cung cấp, không bịa thêm sản phẩm mới.",
      "Cân bằng theo ngân sách, mức ánh sáng, mục tiêu dễ chăm hay decor, và yếu tố thú cưng.",
      "Nếu người dùng có nuôi thú cưng, hãy thận trọng: ưu tiên cây có vẻ an toàn hơn; nếu không chắc, có thể chọn nhưng phải nêu rõ cần kiểm tra thêm.",
      "Ưu tiên dữ liệu từ description, bio, category và careGuides.",
      "Chỉ trả về JSON hợp lệ với schema:",
      "{",
      '  "summary": "string",',
      '  "recommendations": [',
      '    { "id": number, "reason": "string", "fitTags": ["string"] }',
      "  ]",
      "}",
      "Trả 3 đến 5 recommendations.",
      "fitTags ngắn gọn, tối đa 4 mục mỗi sản phẩm.",
      "Viết bằng tiếng Việt tự nhiên.",
    ].join("\n");

    const userPrompt = [
      "Hồ sơ người mua:",
      `- Ngân sách: khoảng ${budget.toLocaleString("vi-VN")}đ`,
      `- Ánh sáng: ${lightLabels[lightLevel]}`,
      `- Có nuôi thú cưng: ${hasPets ? "Có" : "Không"}`,
      `- Ưu tiên: ${priority === "easy-care" ? "dễ chăm" : "decor, đẹp không gian"}`,
      ...(customPrompt ? [`- Yêu cầu thêm từ người dùng: ${customPrompt}`] : []),
      "",
      ...(customPrompt
        ? [
            "Hãy dùng yêu cầu thêm này để tinh chỉnh gợi ý, nhưng vẫn chỉ được chọn từ catalog bên dưới.",
            "",
          ]
        : []),
      "Catalog sản phẩm để chọn:",
      JSON.stringify(shortlist.map(summarizeProductForAdvisor), null, 2),
    ].join("\n");

    const aiResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model,
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": siteUrl,
          "X-Title": appName,
        },
        timeout: 45000,
      }
    );

    const parsed = tryParseJson(aiResponse?.data?.choices?.[0]?.message?.content);
    const normalized = normalizeAdvisorOutput(parsed, productMap);

    const advisorResult = !normalized.recommendations.length
      ? buildFallbackAdvisorResponse(shortlist, preferences)
      : {
          summary: normalized.summary || buildFallbackAdvisorResponse(shortlist, preferences).summary,
          recommendations: normalized.recommendations.slice(0, 5),
        };

    while (advisorResult.recommendations.length < 3) {
      const existingIds = new Set(advisorResult.recommendations.map((entry) => Number(entry.product.id)));
      const filler = shortlist.find((product) => !existingIds.has(Number(product.id)));
      if (!filler) break;
      advisorResult.recommendations.push({
        product: filler,
        reason: buildFallbackReason(filler, preferences),
        fitTags: buildFallbackFitTags(filler, preferences),
      });
    }

    if (authenticatedUser?.id && advisorResult.recommendations.length) {
      await saveAdvisorHistory(pool, Number(authenticatedUser.id), preferences, advisorResult);
    }

    return res.json(advisorResult);
  } catch (err) {
    if (err?.response?.data?.error?.message) {
      return res.status(502).json({ message: `OpenRouter lỗi: ${err.response.data.error.message}` });
    }
    return next(err);
  }
}

// GET /api/products/advisor/history
async function listProductAdvisorHistory(req, res, next) {
  try {
    const pool = await getPool();
    await ensureAdvisorHistoryTable(pool);

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("limit", sql.Int, PRODUCT_ADVISOR_HISTORY_LIMIT)
      .query(
        `SELECT TOP (@limit)
                id, budget, light_level AS lightLevel, has_pets AS hasPets,
                priority, custom_prompt AS customPrompt, summary, recommendations_json AS recommendationsJson, created_at AS createdAt
         FROM UserPlantAdvisorHistory
         WHERE user_id = @userId
         ORDER BY created_at DESC, id DESC`
      );

    const rows = result.recordset.map((row) => ({
      ...row,
      recommendationsJson: tryParseJson(row.recommendationsJson) || [],
    }));

    const productIds = rows.flatMap((row) =>
      Array.isArray(row.recommendationsJson)
        ? row.recommendationsJson.map((entry) => Number(entry?.id ?? entry?.productId))
        : []
    );
    const products = await fetchProductsByIds(pool, productIds);
    const productMap = new Map(products.map((product) => [Number(product.id), product]));

    return res.json(
      rows.map((row) => ({
        id: Number(row.id),
        budget: Number(row.budget || 0),
        lightLevel: String(row.lightLevel || "").trim(),
        hasPets: !!row.hasPets,
        priority: String(row.priority || "").trim(),
        customPrompt: normalizeCustomPrompt(row.customPrompt),
        summary: String(row.summary || "").trim(),
        createdAt: row.createdAt,
        recommendations: normalizeHistoryRecommendations(row.recommendationsJson, productMap),
      }))
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id
async function getProductById(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(
        `SELECT p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
                p.description, p.image_url AS imageUrl, c.name AS category,
                p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
         FROM Products p
         LEFT JOIN Categories c ON p.category_id = c.id
         WHERE p.id = @id`
      );

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });

    const products = await enrichProducts(pool, result.recordset);
    return res.json(products[0]);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id/related
async function getRelatedProducts(req, res, next) {
  try {
    const { limit = 4 } = req.query;
    const pool = await getPool();

    const targetResult = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query("SELECT category_id FROM Products WHERE id = @id");

    if (targetResult.recordset.length === 0)
      return res.json([]);

    const categoryId = targetResult.recordset[0].category_id;
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .input("categoryId", sql.Int, categoryId)
      .input("limit", sql.Int, parseInt(limit))
      .query(
        `SELECT TOP (@limit) p.id, p.title, p.price, p.original_price AS originalPrice,
                p.discount, p.description, p.image_url AS imageUrl, c.name AS category,
                p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
         FROM Products p
         LEFT JOIN Categories c ON p.category_id = c.id
         WHERE p.id <> @id
         ORDER BY CASE WHEN p.category_id = @categoryId THEN 0 ELSE 1 END, p.id`
      );

    const products = await enrichProducts(pool, result.recordset);
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

// Helper: enrich products with images and care guides
async function enrichProducts(pool, products) {
  if (products.length === 0) return products;

  const ids = products.map((p) => p.id);
  const idList = ids.join(",");

  const imagesResult = await pool
    .request()
    .query(`SELECT product_id, url FROM ProductImages WHERE product_id IN (${idList}) ORDER BY sort_order`);

  const careResult = await pool
    .request()
    .query(`SELECT product_id, title, content FROM CareGuides WHERE product_id IN (${idList}) ORDER BY sort_order`);

  const imagesMap = {};
  for (const img of imagesResult.recordset) {
    if (!imagesMap[img.product_id]) imagesMap[img.product_id] = [];
    imagesMap[img.product_id].push(img.url);
  }

  const careMap = {};
  for (const c of careResult.recordset) {
    if (!careMap[c.product_id]) careMap[c.product_id] = [];
    careMap[c.product_id].push({ title: c.title, content: c.content });
  }

  return products.map((p) => ({
    ...p,
    images: imagesMap[p.id] || [p.imageUrl],
    careGuide: careMap[p.id] || [],
    planterOptions: p.planterOptions ? JSON.parse(p.planterOptions) : []
  }));
}

module.exports = {
  getProducts,
  searchProducts,
  getProductById,
  getRelatedProducts,
  getProductAdvisorRecommendations,
  listProductAdvisorHistory,
};
