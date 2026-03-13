const { getPool, sql } = require("../libs/db");

// GET /api/products
async function getProducts(req, res, next) {
  try {
    const { category, search, minPrice, maxPrice, page = 1, pageSize = 9 } = req.query;
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
              p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions
       FROM Products p
       LEFT JOIN Categories c ON p.category_id = c.id
       ${where}
       ORDER BY p.id
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
    );

    const products = await enrichProducts(pool, result.recordset);
    return res.json({ products, total });
  } catch (err) {
    next(err);
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
