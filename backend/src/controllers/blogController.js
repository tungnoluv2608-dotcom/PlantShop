const { getPool, sql } = require("../libs/db");

function parseTags(raw) {
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

// GET /api/blog
async function getBlogPosts(req, res, next) {
  try {
    const { category, search, featured } = req.query;
    const pool = await getPool();
    const request = pool.request();

    let where = "WHERE 1=1";
    if (category && String(category).trim()) {
      request.input("category", sql.NVarChar, String(category).trim());
      where += " AND category = @category";
    }
    if (search && String(search).trim()) {
      request.input("search", sql.NVarChar, `%${String(search).trim()}%`);
      where += " AND (title LIKE @search OR excerpt LIKE @search OR content LIKE @search OR tags LIKE @search)";
    }
    if (featured !== undefined) {
      const isFeatured = String(featured).toLowerCase() === "true";
      request.input("featured", sql.Bit, isFeatured);
      where += " AND featured = @featured";
    }

    const result = await request.query(
      `SELECT id, title, image, excerpt, content, category, read_time AS readTime,
              tags, featured, CONVERT(varchar, date, 23) AS date
       FROM BlogPosts
       ${where}
       ORDER BY date DESC, id DESC`
    );

    const posts = result.recordset.map((p) => ({
      ...p,
      id: String(p.id),
      tags: parseTags(p.tags),
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
      tags: parseTags(p.tags),
      featured: !!p.featured,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/blog/categories
async function getBlogCategories(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT category, COUNT(*) AS total
       FROM BlogPosts
       WHERE category IS NOT NULL AND LTRIM(RTRIM(category)) <> ''
       GROUP BY category
       ORDER BY total DESC, category ASC`
    );

    return res.json(
      result.recordset.map((row) => ({
        name: row.category,
        total: row.total,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { getBlogPosts, getBlogPostById, getBlogCategories };
