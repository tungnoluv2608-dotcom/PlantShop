const { getPool, sql } = require("../libs/db");

// GET /api/reviews?productId=
async function getReviewsByProduct(req, res, next) {
  try {
    const { productId } = req.query;
    if (!productId)
      return res.status(400).json({ message: "Thiếu productId." });

    const pool = await getPool();
    const reviews = await pool
      .request()
      .input("productId", sql.Int, productId)
      .query(
        `SELECT r.id, r.product_id AS productId, r.user_name AS userName,
                r.avatar, r.rating, r.title, r.content, r.helpful, r.verified,
                CONVERT(varchar, r.created_at, 23) AS date
         FROM Reviews r WHERE r.product_id = @productId ORDER BY r.created_at DESC`
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

    const pool = await getPool();

    // Get user name
    const userResult = await pool
      .request()
      .input("id", sql.Int, userId)
      .query("SELECT name FROM Users WHERE id = @id");
    const userName = userResult.recordset[0]?.name || "Khách";

    const result = await pool
      .request()
      .input("productId", sql.Int, productId)
      .input("userId", sql.Int, userId)
      .input("userName", sql.NVarChar, userName)
      .input("avatar", sql.NVarChar, `https://i.pravatar.cc/48?u=${userId}`)
      .input("rating", sql.Int, rating)
      .input("title", sql.NVarChar, title)
      .input("content", sql.NVarChar, content)
      .query(
        `INSERT INTO Reviews (product_id, user_id, user_name, avatar, rating, title, content, helpful, verified)
         OUTPUT INSERTED.id
         VALUES (@productId, @userId, @userName, @avatar, @rating, @title, @content, 0, 0)`
      );

    const reviewId = result.recordset[0].id;

    // Insert tags
    for (const tag of tags) {
      await pool
        .request()
        .input("reviewId", sql.Int, reviewId)
        .input("tag", sql.NVarChar, tag)
        .query("INSERT INTO ReviewTags (review_id, tag) VALUES (@reviewId, @tag)");
    }

    // Insert images
    for (const url of images) {
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
