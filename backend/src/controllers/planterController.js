const { getPool, sql } = require("../libs/db");

// GET /api/planters
async function getPlanters(req, res, next) {
  try {
    const pool = await getPool();
    const plantersResult = await pool.request().query(
      `SELECT id, name, material, price, image_url AS imageUrl, in_stock AS inStock FROM Planters ORDER BY id`
    );
    const sizesResult = await pool.request().query(
      `SELECT planter_id, size_label FROM PlanterSizes ORDER BY planter_id, id`
    );

    const sizesMap = {};
    for (const s of sizesResult.recordset) {
      if (!sizesMap[s.planter_id]) sizesMap[s.planter_id] = [];
      sizesMap[s.planter_id].push(s.size_label);
    }

    const planters = plantersResult.recordset.map((p) => ({
      id: String(p.id),
      name: p.name,
      material: p.material,
      price: p.price,
      imageUrl: p.imageUrl,
      inStock: !!p.inStock,
      sizes: sizesMap[p.id] || [],
    }));

    return res.json(planters);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlanters };
