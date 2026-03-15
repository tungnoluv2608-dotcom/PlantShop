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

// GET /api/planters/:id
async function getPlanterById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const typeFilter = String(req.query.type || "").trim().toLowerCase();
    const pool = await getPool();
    const hasMeta = await hasAccessoryMetaColumns(pool);

    const request = pool.request().input("id", sql.Int, id);
    let typeWhere = "";
    if (typeFilter === "planter" || typeFilter === "accessory") {
      request.input("type", sql.NVarChar, typeFilter);
      typeWhere = "AND type = @type";
    }

    const result = await request.query(
      `SELECT id, name, material,
              ${hasMeta ? "accessory_brand" : "NULL"} AS accessoryBrand,
              ${hasMeta ? "accessory_uses" : "NULL"} AS accessoryUses,
              price, image_url AS imageUrl, in_stock AS inStock, type
       FROM Planters
       WHERE id = @id ${typeWhere}`
    );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại." });
    }

    const sizesResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT size_label FROM PlanterSizes WHERE planter_id = @id ORDER BY id");

    const p = result.recordset[0];
    return res.json({
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
      sizes: sizesResult.recordset.map((s) => s.size_label),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getPlanters, getPlanterById };
