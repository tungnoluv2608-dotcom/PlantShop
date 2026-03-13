const { getPool, sql } = require("../libs/db");

// GET /api/blog
async function getBlogPosts(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, title, image, excerpt, content, category, read_time AS readTime,
              tags, featured, CONVERT(varchar, date, 23) AS date
       FROM BlogPosts ORDER BY date DESC`
    );
    const posts = result.recordset.map((p) => ({
      ...p,
      id: String(p.id),
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
      featured: !!p.featured,
    }));
    return res.json(posts);
  } catch (err) {
    next(err);
  }
}

// GET /api/blog/:id
async function getBlogPostById(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(
        `SELECT id, title, image, excerpt, content, category, read_time AS readTime,
                tags, featured, CONVERT(varchar, date, 23) AS date
         FROM BlogPosts WHERE id = @id`
      );

    if (result.recordset.length === 0)
      return res.status(404).json({ message: "Bài viết không tồn tại." });

    const p = result.recordset[0];
    return res.json({
      ...p,
      id: String(p.id),
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()) : [],
      featured: !!p.featured,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getBlogPosts, getBlogPostById };
