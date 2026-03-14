const { getPool, sql } = require("../libs/db");

// GET /api/reviews?productId=
async function getReviewsByProduct(req, res, next) {
  try {
    const { productId } = req.query;
    if (!productId)
      return res.status(400).json({ message: "Thiếu productId." });
    const parsedProductId = Number(productId);
    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0)
      return res.status(400).json({ message: "productId không hợp lệ." });

    const pool = await getPool();
    const reviews = await pool
      .request()
      .input("productId", sql.Int, parsedProductId)
      .query(
        `SELECT r.id, r.product_id AS productId, r.user_name AS userName,
                r.avatar, r.rating, r.title, r.content, r.helpful, r.verified,
                CONVERT(varchar, r.created_at, 23) AS date
         FROM Reviews r
         WHERE r.product_id = @productId AND r.visible = 1
         ORDER BY r.created_at DESC`
      );

    const ids = reviews.recordset.map((r) => r.id);
    if (ids.length === 0) return res.json([]);

    const imagesResult = await pool
      .request()
      .query(`SELECT review_id, url FROM ReviewImages WHERE review_id IN (${ids.join(",")})`);
    const tagsResult = await pool
      .request()
      .query(`SELECT review_id, tag FROM ReviewTags WHERE review_id IN (${ids.join(",")})`);

    const imagesMap = {};
    for (const img of imagesResult.recordset) {
      if (!imagesMap[img.review_id]) imagesMap[img.review_id] = [];
      imagesMap[img.review_id].push(img.url);
    }
    const tagsMap = {};
    for (const t of tagsResult.recordset) {
      if (!tagsMap[t.review_id]) tagsMap[t.review_id] = [];
      tagsMap[t.review_id].push(t.tag);
    }

    const result = reviews.recordset.map((r) => ({
      ...r,
      id: String(r.id),
      productId: String(r.productId),
      verified: !!r.verified,
      images: imagesMap[r.id] || [],
      tags: tagsMap[r.id] || [],
    }));
    return res.json(result);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews
async function createReview(req, res, next) {
  try {
    const { productId, rating, title, content, tags = [], images = [] } = req.body;
    const userId = req.user.id;

    const parsedProductId = Number(productId);
    const parsedRating = Number(rating);
    if (!Number.isInteger(parsedProductId) || parsedProductId <= 0)
      return res.status(400).json({ message: "productId không hợp lệ." });
    if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5)
      return res.status(400).json({ message: "rating phải từ 1 đến 5." });
    if (!title || String(title).trim().length < 3)
      return res.status(400).json({ message: "Tiêu đề đánh giá tối thiểu 3 ký tự." });
    if (!content || String(content).trim().length < 10)
      return res.status(400).json({ message: "Nội dung đánh giá tối thiểu 10 ký tự." });
    if (!Array.isArray(tags) || !Array.isArray(images))
      return res.status(400).json({ message: "tags và images phải là mảng." });

    const pool = await getPool();

    const productExists = await pool
      .request()
      .input("id", sql.Int, parsedProductId)
      .query("SELECT id FROM Products WHERE id = @id");
    if (productExists.recordset.length === 0)
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });

    // Check if user has a delivered order for this product
    const purchaseCheck = await pool.request()
        .input("userId", sql.Int, userId)
        .input("productId", sql.Int, parsedProductId)
        .query(`
            SELECT TOP 1 o.id 
            FROM Orders o
            JOIN OrderItems oi ON o.id = oi.order_id
            WHERE o.user_id = @userId 
              AND oi.product_id = @productId 
              AND o.status = 'delivered'
        `);

    if (purchaseCheck.recordset.length === 0) {
        return res.status(403).json({ message: "Bạn chỉ có thể đánh giá sản phẩm sau khi đơn hàng đã được giao thành công." });
    }

    // Get user name
    const userResult = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT name FROM Users WHERE id = @id");
    const userName = userResult.recordset[0]?.name || "Khách";

    const result = await pool
      .request()
      .input("productId", sql.Int, parsedProductId)
      .input("userId", sql.Int, userId)
      .input("userName", sql.NVarChar, userName)
      .input("avatar", sql.NVarChar, `https://i.pravatar.cc/48?u=${userId}`)
      .input("rating", sql.Int, parsedRating)
      .input("title", sql.NVarChar, String(title).trim())
      .input("content", sql.NVarChar, String(content).trim())
      .query(
        `INSERT INTO Reviews (product_id, user_id, user_name, avatar, rating, title, content, helpful, verified, visible)
         OUTPUT INSERTED.id
         VALUES (@productId, @userId, @userName, @avatar, @rating, @title, @content, 0, 1, 1)`
      );

    const reviewId = result.recordset[0].id;

    // Insert tags
    for (const tag of tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 8)) {
      await pool
        .request()
        .input("reviewId", sql.Int, reviewId)
        .input("tag", sql.NVarChar, tag)
        .query("INSERT INTO ReviewTags (review_id, tag) VALUES (@reviewId, @tag)");
    }

    // Insert images
    for (const url of images.map((u) => String(u).trim()).filter(Boolean).slice(0, 5)) {
      await pool
        .request()
        .input("reviewId", sql.Int, reviewId)
        .input("url", sql.NVarChar, url)
        .query("INSERT INTO ReviewImages (review_id, url) VALUES (@reviewId, @url)");
    }

    return res.status(201).json({ message: "Đánh giá đã được gửi.", id: reviewId });
  } catch (err) {
    next(err);
  }
}

module.exports = { getReviewsByProduct, createReview };
