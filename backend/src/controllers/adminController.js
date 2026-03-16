const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getPool, sql } = require("../libs/db");

async function hasAccessoryMetaColumns(pool) {
  const result = await pool.request().query(
    `SELECT name
     FROM sys.columns
     WHERE object_id = OBJECT_ID('Planters')
       AND name IN ('accessory_brand', 'accessory_uses')`
  );
  const names = new Set(result.recordset.map((row) => row.name));
  return names.has("accessory_brand") && names.has("accessory_uses");
}

// POST /api/admin/login
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const pool = await getPool();
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT id, name, email, password_hash, role FROM Users WHERE email = @email AND role = 'admin'");

    if (result.recordset.length === 0)
      return res.status(401).json({ message: "Tài khoản admin không tồn tại." });

    const user = result.recordset[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: "Mật khẩu không chính xác." });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const pool = await getPool();
    const [ordersRes, productsRes, usersRes, revenueRes] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS total FROM Orders"),
      pool.request().query("SELECT COUNT(*) AS total FROM Products"),
      pool.request().query("SELECT COUNT(*) AS total FROM Users WHERE role = 'customer'"),
      pool.request().query("SELECT ISNULL(SUM(total), 0) AS total FROM Orders WHERE status = 'delivered'"),
    ]);
    return res.json({
      totalOrders: ordersRes.recordset[0].total,
      totalProducts: productsRes.recordset[0].total,
      totalCustomers: usersRes.recordset[0].total,
      totalRevenue: revenueRes.recordset[0].total,
    });
  } catch (err) {
    next(err);
  }
}

// ── Products CRUD ──────────────────────────────────────────────
async function listProducts(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
              p.description, p.image_url AS imageUrl, c.name AS category,
              p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
       FROM Products p LEFT JOIN Categories c ON p.category_id = c.id ORDER BY p.id DESC`
    );
    const products = result.recordset.map(p => ({
      ...p,
      planterOptions: p.planterOptions ? JSON.parse(p.planterOptions) : []
    }));
    return res.json(products);
  } catch (err) { next(err); }
}

async function createProduct(req, res, next) {
  try {
    const { title, price, originalPrice, discount, description, imageUrl, categoryId, bio, inStock, images, careGuide, planterOptions } = req.body;
    const pool = await getPool();
    const result = await pool.request()
      .input("title", sql.NVarChar, title)
      .input("price", sql.Decimal(18, 2), price)
      .input("originalPrice", sql.Decimal(18, 2), originalPrice || null)
      .input("discount", sql.NVarChar, discount || null)
      .input("description", sql.NVarChar, description)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .input("categoryId", sql.Int, categoryId)
      .input("bio", sql.NVarChar, bio || null)
      .input("inStock", sql.Bit, inStock !== false)
      .input("planterOptions", sql.NVarChar, planterOptions ? JSON.stringify(planterOptions) : null)
      .query(`INSERT INTO Products (title, price, original_price, discount, description, image_url, category_id, bio, in_stock, planter_options)
              OUTPUT INSERTED.id VALUES (@title, @price, @originalPrice, @discount, @description, @imageUrl, @categoryId, @bio, @inStock, @planterOptions)`);

    const productId = result.recordset[0].id;
    if (images?.length) {
      for (let i = 0; i < images.length; i++) {
        await pool.request().input("pid", sql.Int, productId).input("url", sql.NVarChar, images[i]).input("sort", sql.Int, i)
          .query("INSERT INTO ProductImages (product_id, url, sort_order) VALUES (@pid, @url, @sort)");
      }
    }
    if (careGuide?.length) {
      for (let i = 0; i < careGuide.length; i++) {
        await pool.request().input("pid", sql.Int, productId).input("title", sql.NVarChar, careGuide[i].title)
          .input("content", sql.NVarChar, careGuide[i].content).input("sort", sql.Int, i)
          .query("INSERT INTO CareGuides (product_id, title, content, sort_order) VALUES (@pid, @title, @content, @sort)");
      }
    }
    return res.status(201).json({ id: productId, message: "Đã tạo sản phẩm." });
  } catch (err) { next(err); }
}

async function updateProduct(req, res, next) {
  try {
    const { title, price, originalPrice, discount, description, imageUrl, categoryId, bio, inStock, images, careGuide, planterOptions } = req.body;
    const pool = await getPool();
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .input("title", sql.NVarChar, title)
      .input("price", sql.Decimal(18, 2), price)
      .input("originalPrice", sql.Decimal(18, 2), originalPrice || null)
      .input("discount", sql.NVarChar, discount || null)
      .input("description", sql.NVarChar, description)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .input("categoryId", sql.Int, categoryId)
      .input("bio", sql.NVarChar, bio || null)
      .input("inStock", sql.Bit, inStock !== false)
      .input("planterOptions", sql.NVarChar, planterOptions ? JSON.stringify(planterOptions) : null)
      .query(`UPDATE Products SET title=@title, price=@price, original_price=@originalPrice, discount=@discount,
              description=@description, image_url=@imageUrl, category_id=@categoryId, bio=@bio, in_stock=@inStock, planter_options=@planterOptions
              WHERE id=@id`);

    // Replace images and care guides
    if (images) {
      await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM ProductImages WHERE product_id=@id");
      for (let i = 0; i < images.length; i++) {
        await pool.request().input("pid", sql.Int, req.params.id).input("url", sql.NVarChar, images[i]).input("sort", sql.Int, i)
          .query("INSERT INTO ProductImages (product_id, url, sort_order) VALUES (@pid, @url, @sort)");
      }
    }
    if (careGuide) {
      await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM CareGuides WHERE product_id=@id");
      for (let i = 0; i < careGuide.length; i++) {
        await pool.request().input("pid", sql.Int, req.params.id).input("title2", sql.NVarChar, careGuide[i].title)
          .input("content", sql.NVarChar, careGuide[i].content).input("sort", sql.Int, i)
          .query("INSERT INTO CareGuides (product_id, title, content, sort_order) VALUES (@pid, @title2, @content, @sort)");
      }
    }
    return res.json({ message: "Đã cập nhật sản phẩm." });
  } catch (err) { next(err); }
}

async function deleteProduct(req, res, next) {
  try {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM ProductImages WHERE product_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM CareGuides WHERE product_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM Products WHERE id=@id");
    return res.json({ message: "Đã xóa sản phẩm." });
  } catch (err) { next(err); }
}

// ── Orders ─────────────────────────────────────────────────────
async function listAllOrders(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT o.id, CONVERT(varchar, o.created_at, 23) AS date, o.status,
              u.name AS customerName, u.email AS customerEmail,
              o.shipping_address AS shippingAddress,
              o.total, o.payment_method AS paymentMethod,
              ISNULL((SELECT SUM(oi.quantity) FROM OrderItems oi WHERE oi.order_id = o.id), 0) AS itemCount
       FROM Orders o JOIN Users u ON o.user_id = u.id ORDER BY o.created_at DESC`
    );
    return res.json(result.recordset);
  } catch (err) { next(err); }
}

async function updateOrderStatus(req, res, next) {
  try {
    const { status, timelineEntry } = req.body;
    const pool = await getPool();
    await pool.request().input("id", sql.NVarChar, req.params.id).input("status", sql.NVarChar, status)
      .query("UPDATE Orders SET status=@status WHERE id=@id");

    if (timelineEntry) {
      await pool.request().input("orderId", sql.NVarChar, req.params.id)
        .input("status", sql.NVarChar, timelineEntry)
        .query("INSERT INTO OrderTimeline (order_id, status, event_date, done) VALUES (@orderId, @status, GETDATE(), 1)");
    }
    return res.json({ message: "Đã cập nhật trạng thái đơn hàng." });
  } catch (err) { next(err); }
}

// GET /api/admin/orders/:id  (admin, no user_id check)
async function adminGetOrderById(req, res, next) {
  try {
    const pool = await getPool();
    const { getPool: _gp, sql: _s, ...orderController } = require("../controllers/orderController");
    // Inline the enrichment
    const orderResult = await pool.request().input("id", sql.NVarChar, req.params.id)
      .query(
        `SELECT o.id, CONVERT(varchar, o.created_at, 23) AS date, o.status,
                o.shipping_address AS shippingAddress, o.payment_method AS paymentMethod,
                o.subtotal, o.shipping_fee AS shippingFee, o.total, o.tracking_number AS trackingNumber
         FROM Orders o WHERE o.id = @id`
      );
    if (orderResult.recordset.length === 0)
      return res.status(404).json({ message: "Đơn hàng không tồn tại." });

    const order = orderResult.recordset[0];
    const ids = `'${order.id}'`;
    const itemsResult = await pool.request().query(
      `SELECT order_id, product_id AS id, title, price, quantity, image_url AS image, planter_name AS planter FROM OrderItems WHERE order_id IN (${ids})`
    );
    const timelineResult = await pool.request().query(
      `SELECT order_id, status, CONVERT(varchar, event_date, 120) AS date, done FROM OrderTimeline WHERE order_id IN (${ids}) ORDER BY event_date ASC`
    );
    const enriched = {
      ...order,
      items: itemsResult.recordset.map((i) => ({ id: String(i.id), title: i.title, price: i.price, quantity: i.quantity, image: i.image, planter: i.planter })),
      timeline: timelineResult.recordset.map((t) => ({ status: t.status, date: t.date, done: !!t.done })),
    };
    return res.json(enriched);
  } catch (err) { next(err); }
}

// ── Customers ──────────────────────────────────────────────────
async function listCustomers(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT u.id, u.name, u.email, u.role,
              (SELECT COUNT(*) FROM Orders o WHERE o.user_id = u.id) AS orderCount,
              (SELECT ISNULL(SUM(total),0) FROM Orders o WHERE o.user_id = u.id) AS totalSpent,
              CONVERT(varchar, u.created_at, 23) AS created_at
       FROM Users u WHERE u.role = 'customer' ORDER BY u.created_at DESC`
    );
    return res.json(result.recordset);
  } catch (err) { next(err); }
}

// ── Categories CRUD ────────────────────────────────────────────
async function listCategories(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query("SELECT id, name, image FROM Categories ORDER BY id");
    const subResult = await pool.request().query("SELECT category_id, name FROM CategorySubcategories ORDER BY id");
    const subMap = {};
    for (const s of subResult.recordset) {
      if (!subMap[s.category_id]) subMap[s.category_id] = [];
      subMap[s.category_id].push(s.name);
    }
    return res.json(result.recordset.map((c) => ({ ...c, id: String(c.id), subcategories: subMap[c.id] || [] })));
  } catch (err) { next(err); }
}

async function createCategory(req, res, next) {
  try {
    const { name, image, subcategories = [] } = req.body;
    const pool = await getPool();
    const result = await pool.request().input("name", sql.NVarChar, name).input("image", sql.NVarChar, image)
      .query("INSERT INTO Categories (name, image) OUTPUT INSERTED.id VALUES (@name, @image)");
    const catId = result.recordset[0].id;
    for (const sub of subcategories) {
      await pool.request().input("catId", sql.Int, catId).input("sub", sql.NVarChar, sub)
        .query("INSERT INTO CategorySubcategories (category_id, name) VALUES (@catId, @sub)");
    }
    return res.status(201).json({ id: catId, message: "Đã tạo danh mục." });
  } catch (err) { next(err); }
}

async function updateCategory(req, res, next) {
  try {
    const { name, image, subcategories } = req.body;
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).input("name", sql.NVarChar, name).input("image", sql.NVarChar, image)
      .query("UPDATE Categories SET name=@name, image=@image WHERE id=@id");
    if (subcategories) {
      await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM CategorySubcategories WHERE category_id=@id");
      for (const sub of subcategories) {
        await pool.request().input("catId", sql.Int, req.params.id).input("sub", sql.NVarChar, sub)
          .query("INSERT INTO CategorySubcategories (category_id, name) VALUES (@catId, @sub)");
      }
    }
    return res.json({ message: "Đã cập nhật danh mục." });
  } catch (err) { next(err); }
}

async function deleteCategory(req, res, next) {
  try {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM CategorySubcategories WHERE category_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM Categories WHERE id=@id");
    return res.json({ message: "Đã xóa danh mục." });
  } catch (err) { next(err); }
}

// ── Reviews ────────────────────────────────────────────────────
async function listAllReviews(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT r.id, r.product_id AS productId, p.title AS productTitle,
              r.user_name AS userName, r.rating, r.title, r.content,
              r.verified, CONVERT(varchar, r.created_at, 23) AS createdAt,
              ISNULL(r.visible, 1) AS visible
       FROM Reviews r JOIN Products p ON r.product_id = p.id ORDER BY r.created_at DESC`
    );
    // Fetch images and tags for each review
    const reviews = result.recordset.map((r) => ({ ...r, visible: !!r.visible, verified: !!r.verified, images: [], tags: [] }));
    const ids = reviews.map((r) => r.id);
    if (ids.length) {
      const imgRes = await pool.request().query(`SELECT review_id, url FROM ReviewImages WHERE review_id IN (${ids.join(',')})`);
      const tagRes = await pool.request().query(`SELECT review_id, tag FROM ReviewTags WHERE review_id IN (${ids.join(',')})`);
      for (const img of imgRes.recordset) {
        const r = reviews.find((x) => x.id === img.review_id);
        if (r) r.images.push(img.url);
      }
      for (const tag of tagRes.recordset) {
        const r = reviews.find((x) => x.id === tag.review_id);
        if (r) r.tags.push(tag.tag);
      }
    }
    return res.json(reviews);
  } catch (err) { next(err); }
}

async function updateReview(req, res, next) {
  try {
    const { verified, visible } = req.body;
    const pool = await getPool();
    const updates = [];
    const req2 = pool.request().input("id", sql.Int, req.params.id);
    if (verified !== undefined) { req2.input("verified", sql.Bit, verified); updates.push("verified=@verified"); }
    if (visible !== undefined) { req2.input("visible", sql.Bit, visible); updates.push("visible=@visible"); }
    if (updates.length) {
      await req2.query(`UPDATE Reviews SET ${updates.join(",")} WHERE id=@id`);
    }
    return res.json({ message: "Đã cập nhật đánh giá." });
  } catch (err) { next(err); }
}

async function deleteReview(req, res, next) {
  try {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM ReviewImages WHERE review_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM ReviewTags WHERE review_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM Reviews WHERE id=@id");
    return res.json({ message: "Đã xóa đánh giá." });
  } catch (err) { next(err); }
}

// ── Planters CRUD ──────────────────────────────────────────────
async function adminListPlanters(req, res, next) {
  try {
    const typeFilter = String(req.query.type || "").trim().toLowerCase();
    const pool = await getPool();
    const hasMeta = await hasAccessoryMetaColumns(pool);
    const request = pool.request();
    let whereClause = "";
    if (typeFilter === "planter" || typeFilter === "accessory") {
      request.input("type", sql.NVarChar, typeFilter);
      whereClause = "WHERE type = @type";
    }

    const plantersResult = await request.query(
      `SELECT id, name, material,
              ${hasMeta ? "accessory_brand" : "NULL"} AS accessoryBrand,
              ${hasMeta ? "accessory_uses" : "NULL"} AS accessoryUses,
              price, image_url AS imageUrl, in_stock AS inStock, type
       FROM Planters
       ${whereClause}
       ORDER BY id`
    );
    const sizesResult = await pool.request().query("SELECT planter_id, size_label FROM PlanterSizes ORDER BY id");
    const sizesMap = {};
    for (const s of sizesResult.recordset) {
      if (!sizesMap[s.planter_id]) sizesMap[s.planter_id] = [];
      sizesMap[s.planter_id].push(s.size_label);
    }
    return res.json(plantersResult.recordset.map((p) => ({
      ...p,
      id: String(p.id),
      inStock: !!p.inStock,
      accessoryBrand: p.accessoryBrand || "",
      usageTags: (() => {
        if (!p.accessoryUses) return [];
        try {
          const parsed = JSON.parse(p.accessoryUses);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return String(p.accessoryUses).split(",").map((tag) => tag.trim()).filter(Boolean);
        }
      })(),
      sizes: sizesMap[p.id] || []
    })));
  } catch (err) { next(err); }
}

async function createPlanter(req, res, next) {
  try {
    const { name, material, accessoryBrand, usageTags, price, imageUrl, inStock, type, sizes = [] } = req.body;
    const normalizedUsageTags = Array.isArray(usageTags)
      ? usageTags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(usageTags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    const pool = await getPool();
    const hasMeta = await hasAccessoryMetaColumns(pool);
    const request = pool.request()
      .input("name", sql.NVarChar, name)
      .input("material", sql.NVarChar, material)
      .input("price", sql.Decimal(18, 2), price)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .input("inStock", sql.Bit, inStock !== false)
      .input("type", sql.NVarChar, type || "planter");

    if (hasMeta) {
      request
        .input("accessoryBrand", sql.NVarChar, accessoryBrand || null)
        .input("accessoryUses", sql.NVarChar, normalizedUsageTags.length ? JSON.stringify(normalizedUsageTags) : null);
    }

    const result = await request.query(
      hasMeta
        ? "INSERT INTO Planters (name, material, accessory_brand, accessory_uses, price, image_url, in_stock, type) OUTPUT INSERTED.id VALUES (@name, @material, @accessoryBrand, @accessoryUses, @price, @imageUrl, @inStock, @type)"
        : "INSERT INTO Planters (name, material, price, image_url, in_stock, type) OUTPUT INSERTED.id VALUES (@name, @material, @price, @imageUrl, @inStock, @type)"
    );
    const planterId = result.recordset[0].id;
    for (const s of sizes) {
      await pool.request().input("pid", sql.Int, planterId).input("size", sql.NVarChar, s)
        .query("INSERT INTO PlanterSizes (planter_id, size_label) VALUES (@pid, @size)");
    }
    return res.status(201).json({ id: planterId, message: "Đã tạo chậu cây." });
  } catch (err) { next(err); }
}

async function updatePlanter(req, res, next) {
  try {
    const { name, material, accessoryBrand, usageTags, price, imageUrl, inStock, type, sizes } = req.body;
    const normalizedUsageTags = Array.isArray(usageTags)
      ? usageTags.map((tag) => String(tag).trim()).filter(Boolean)
      : String(usageTags || "").split(",").map((tag) => tag.trim()).filter(Boolean);
    const pool = await getPool();
    const hasMeta = await hasAccessoryMetaColumns(pool);
    const request = pool.request()
      .input("id", sql.Int, req.params.id)
      .input("name", sql.NVarChar, name)
      .input("material", sql.NVarChar, material)
      .input("price", sql.Decimal(18, 2), price)
      .input("imageUrl", sql.NVarChar, imageUrl)
      .input("inStock", sql.Bit, inStock !== false)
      .input("type", sql.NVarChar, type || "planter");

    if (hasMeta) {
      request
        .input("accessoryBrand", sql.NVarChar, accessoryBrand || null)
        .input("accessoryUses", sql.NVarChar, normalizedUsageTags.length ? JSON.stringify(normalizedUsageTags) : null);
    }

    await request.query(
      hasMeta
        ? "UPDATE Planters SET name=@name, material=@material, accessory_brand=@accessoryBrand, accessory_uses=@accessoryUses, price=@price, image_url=@imageUrl, in_stock=@inStock, type=@type WHERE id=@id"
        : "UPDATE Planters SET name=@name, material=@material, price=@price, image_url=@imageUrl, in_stock=@inStock, type=@type WHERE id=@id"
    );
    if (sizes) {
      await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM PlanterSizes WHERE planter_id=@id");
      for (const s of sizes) {
        await pool.request().input("pid", sql.Int, req.params.id).input("size", sql.NVarChar, s)
          .query("INSERT INTO PlanterSizes (planter_id, size_label) VALUES (@pid, @size)");
      }
    }
    return res.json({ message: "Đã cập nhật chậu cây." });
  } catch (err) { next(err); }
}

async function deletePlanter(req, res, next) {
  try {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM PlanterSizes WHERE planter_id=@id");
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM Planters WHERE id=@id");
    return res.json({ message: "Đã xóa chậu cây." });
  } catch (err) { next(err); }
}

// ── Blog CRUD ──────────────────────────────────────────────────
async function adminListBlog(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, title, image, excerpt, content, category,
              read_time AS readTime, tags, featured,
              CONVERT(varchar, date, 23) AS date
       FROM BlogPosts
       ORDER BY date DESC, id DESC`
    );
    return res.json(
      result.recordset.map((p) => ({
        ...p,
        id: String(p.id),
        tags: p.tags
          ? p.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        featured: !!p.featured,
      }))
    );
  } catch (err) { next(err); }
}

async function createBlogPost(req, res, next) {
  try {
    const {
      title,
      image,
      excerpt,
      content,
      category,
      readTime,
      tags = [],
      featured = false,
      date,
    } = req.body;

    const normalizedTitle = String(title || "").trim();
    const normalizedContent = String(content || "").trim();
    const normalizedCategory = String(category || "").trim();
    const normalizedImage = String(image || "").trim();
    const normalizedExcerpt = String(excerpt || "").trim();

    if (!normalizedTitle || !normalizedContent || !normalizedCategory || !normalizedImage) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc của bài viết." });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : String(tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    const autoReadTime = `${Math.max(1, Math.ceil(normalizedContent.split(/\s+/).filter(Boolean).length / 220))} phút`;

    const pool = await getPool();
    const result = await pool.request()
      .input("title", sql.NVarChar, normalizedTitle).input("image", sql.NVarChar, normalizedImage)
      .input("excerpt", sql.NVarChar, normalizedExcerpt).input("content", sql.NVarChar, normalizedContent)
      .input("category", sql.NVarChar, normalizedCategory).input("readTime", sql.NVarChar, String(readTime || autoReadTime))
      .input("tags", sql.NVarChar, normalizedTags.join(",")).input("featured", sql.Bit, !!featured)
      .input("date", sql.Date, date || new Date())
      .query(`INSERT INTO BlogPosts (title, image, excerpt, content, category, read_time, tags, featured, date)
              OUTPUT INSERTED.id VALUES (@title, @image, @excerpt, @content, @category, @readTime, @tags, @featured, @date)`);
    return res.status(201).json({ id: result.recordset[0].id, message: "Đã tạo bài viết." });
  } catch (err) { next(err); }
}

async function updateBlogPost(req, res, next) {
  try {
    const { title, image, excerpt, content, category, readTime, tags, featured, date } = req.body;

    const normalizedTitle = String(title || "").trim();
    const normalizedContent = String(content || "").trim();
    const normalizedCategory = String(category || "").trim();
    const normalizedImage = String(image || "").trim();
    const normalizedExcerpt = String(excerpt || "").trim();

    if (!normalizedTitle || !normalizedContent || !normalizedCategory || !normalizedImage) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc của bài viết." });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim()).filter(Boolean)
      : String(tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    const autoReadTime = `${Math.max(1, Math.ceil(normalizedContent.split(/\s+/).filter(Boolean).length / 220))} phút`;

    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id)
      .input("title", sql.NVarChar, normalizedTitle).input("image", sql.NVarChar, normalizedImage)
      .input("excerpt", sql.NVarChar, normalizedExcerpt).input("content", sql.NVarChar, normalizedContent)
      .input("category", sql.NVarChar, normalizedCategory).input("readTime", sql.NVarChar, String(readTime || autoReadTime))
      .input("tags", sql.NVarChar, normalizedTags.join(","))
      .input("featured", sql.Bit, !!featured).input("date", sql.Date, date || new Date())
      .query(`UPDATE BlogPosts SET title=@title, image=@image, excerpt=@excerpt, content=@content,
              category=@category, read_time=@readTime, tags=@tags, featured=@featured, date=@date WHERE id=@id`);
    return res.json({ message: "Đã cập nhật bài viết." });
  } catch (err) { next(err); }
}

async function deleteBlogPost(req, res, next) {
  try {
    const pool = await getPool();
    await pool.request().input("id", sql.Int, req.params.id).query("DELETE FROM BlogPosts WHERE id=@id");
    return res.json({ message: "Đã xóa bài viết." });
  } catch (err) { next(err); }
}

module.exports = {
  adminLogin, getStats,
  listProducts, createProduct, updateProduct, deleteProduct,
  listAllOrders, updateOrderStatus, adminGetOrderById,
  listCustomers,
  listCategories, createCategory, updateCategory, deleteCategory,
  listAllReviews, updateReview, deleteReview,
  adminListPlanters, createPlanter, updatePlanter, deletePlanter,
  adminListBlog, createBlogPost, updateBlogPost, deleteBlogPost,
};
