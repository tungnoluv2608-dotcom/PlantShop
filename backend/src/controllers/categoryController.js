const { getPool, sql } = require("../libs/db");

// GET /api/categories
async function getCategories(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, name, image FROM Categories ORDER BY id`
    );

    const subResult = await pool.request().query(
      `SELECT category_id, name FROM CategorySubcategories ORDER BY category_id, id`
    );

    const subMap = {};
    for (const s of subResult.recordset) {
      if (!subMap[s.category_id]) subMap[s.category_id] = [];
      subMap[s.category_id].push(s.name);
    }

    const categories = result.recordset.map((c) => ({
      id: String(c.id),
      name: c.name,
      image: c.image,
      subcategories: subMap[c.id] || [],
    }));

    return res.json(categories);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories };
