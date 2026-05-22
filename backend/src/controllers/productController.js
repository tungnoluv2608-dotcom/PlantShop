const { getPool, sql } = require("../libs/db");

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

module.exports = { getProducts, searchProducts, getProductById, getRelatedProducts };
