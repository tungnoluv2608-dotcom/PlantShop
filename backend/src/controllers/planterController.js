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

// GET /api/planters
async function getPlanters(req, res, next) {
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
      accessoryBrand: p.accessoryBrand || "",
      usageTags: (() => {
        if (!p.accessoryUses) return [];
        try {
          const parsed = JSON.parse(p.accessoryUses);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return String(p.accessoryUses)
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        }
      })(),
      price: p.price,
      imageUrl: p.imageUrl,
      inStock: !!p.inStock,
      type: p.type === "accessory" ? "accessory" : "planter",
      sizes: sizesMap[p.id] || [],
    }));

    return res.json(planters);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlanters };
