const { getPool, sql } = require("../libs/db");

async function ensureWishlistTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = 'UserWishlistItems'
    )
    BEGIN
      CREATE TABLE UserWishlistItems (
        id         INT IDENTITY(1,1) PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES Users(id),
        product_id INT NOT NULL REFERENCES Products(id),
        created_at DATETIME NOT NULL DEFAULT GETDATE()
      );

      CREATE UNIQUE INDEX UX_UserWishlistItems_User_Product
        ON UserWishlistItems(user_id, product_id);

      CREATE INDEX IX_UserWishlistItems_UserId
        ON UserWishlistItems(user_id);
    END
  `);
}

function enrichProducts(pool, products) {
  if (products.length === 0) return Promise.resolve(products);

  const ids = products.map((p) => p.id);
  const idList = ids.join(",");

  return Promise.all([
    pool.request().query(`SELECT product_id, url FROM ProductImages WHERE product_id IN (${idList}) ORDER BY sort_order`),
    pool.request().query(`SELECT product_id, title, content FROM CareGuides WHERE product_id IN (${idList}) ORDER BY sort_order`),
  ]).then(([imagesResult, careResult]) => {
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
      planterOptions: p.planterOptions ? JSON.parse(p.planterOptions) : [],
      isFavorite: true,
    }));
  });
}

async function listMyWishlist(req, res, next) {
  try {
    const pool = await getPool();
    await ensureWishlistTable(pool);

    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT p.id, p.title, p.price, p.original_price AS originalPrice, p.discount,
                p.description, p.image_url AS imageUrl, c.name AS category,
                p.bio, p.in_stock AS inStock, p.planter_options AS planterOptions,
                w.created_at AS favoriteCreatedAt
         FROM UserWishlistItems w
         INNER JOIN Products p ON p.id = w.product_id
         LEFT JOIN Categories c ON p.category_id = c.id
         WHERE w.user_id = @userId
         ORDER BY w.created_at DESC`
      );

    const products = await enrichProducts(pool, result.recordset);
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Mã sản phẩm không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWishlistTable(pool);

    const productExists = await pool
      .request()
      .input("productId", sql.Int, productId)
      .query("SELECT id FROM Products WHERE id = @productId");

    if (productExists.recordset.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("productId", sql.Int, productId)
      .query(
        `IF NOT EXISTS (
           SELECT 1
           FROM UserWishlistItems
           WHERE user_id = @userId AND product_id = @productId
         )
         BEGIN
           INSERT INTO UserWishlistItems (user_id, product_id)
           VALUES (@userId, @productId)
         END`
      );

    return res.status(201).json({ message: "Đã thêm vào danh sách yêu thích." });
  } catch (err) {
    next(err);
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId) || productId <= 0) {
      return res.status(400).json({ message: "Mã sản phẩm không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWishlistTable(pool);

    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("productId", sql.Int, productId)
      .query("DELETE FROM UserWishlistItems WHERE user_id = @userId AND product_id = @productId");

    return res.json({ message: "Đã xóa khỏi danh sách yêu thích." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMyWishlist,
  addToWishlist,
  removeFromWishlist,
};
