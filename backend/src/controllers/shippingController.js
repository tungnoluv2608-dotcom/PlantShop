const { getPool, sql } = require("../libs/db");
const {
  mapZoneRow,
  getShippingQuote,
  normalizeZonePayload,
  normalizeShippingMethod,
} = require("../services/shippingService");
const {
  normalizeIncomingItems,
  loadCatalogMaps,
  buildCanonicalOrderItems,
} = require("./orderController");

async function quoteShipping(req, res, next) {
  try {
    const shippingMethod = normalizeShippingMethod(req.body?.shippingMethod) || "standard";
    const province = req.body?.province;
    const district = req.body?.district;
    const items = req.body?.items;

    let subtotal = Number(req.body?.subtotal ?? 0);
    if (Array.isArray(items) && items.length > 0) {
      const normalizedItems = normalizeIncomingItems(items);
      const pool = await getPool();
      const { productMap, planterMap } = await loadCatalogMaps(pool, normalizedItems);
      const canonicalItems = buildCanonicalOrderItems(normalizedItems, productMap, planterMap);
      subtotal = canonicalItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0
      );
    }

    if (!province || !String(province).trim()) {
      return res.status(400).json({ message: "Vui lòng chọn tỉnh/thành giao hàng." });
    }

    const pool = await getPool();
    const quote = await getShippingQuote(pool, {
      subtotal,
      shippingMethod,
      province: String(province).trim(),
      district: district ? String(district).trim() : null,
    });

    return res.json(quote);
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

async function adminListShippingZones(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, name, province, district,
              standard_fee AS standardFee, express_fee AS expressFee,
              sameday_fee AS samedayFee, allows_sameday AS allowsSameday,
              free_shipping_threshold AS freeShippingThreshold,
              priority, is_active AS isActive,
              created_at AS createdAt, updated_at AS updatedAt
       FROM ShippingZones
       ORDER BY priority DESC, province ASC, district ASC, id ASC`
    );
    return res.json(result.recordset.map(mapZoneRow));
  } catch (err) {
    next(err);
  }
}

async function adminGetShippingZoneById(req, res, next) {
  try {
    const zoneId = Number(req.params.id);
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      return res.status(400).json({ message: "Mã vùng vận chuyển không hợp lệ." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, zoneId)
      .query(
        `SELECT id, name, province, district,
                standard_fee AS standardFee, express_fee AS expressFee,
                sameday_fee AS samedayFee, allows_sameday AS allowsSameday,
                free_shipping_threshold AS freeShippingThreshold,
                priority, is_active AS isActive,
                created_at AS createdAt, updated_at AS updatedAt
         FROM ShippingZones
         WHERE id = @id`
      );

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Không tìm thấy vùng vận chuyển." });
    }

    return res.json(mapZoneRow(result.recordset[0]));
  } catch (err) {
    next(err);
  }
}

async function adminCreateShippingZone(req, res, next) {
  try {
    const payload = normalizeZonePayload(req.body);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("name", sql.NVarChar, payload.name)
      .input("province", sql.NVarChar, payload.province)
      .input("district", sql.NVarChar, payload.district)
      .input("standardFee", sql.Decimal(18, 2), payload.standardFee)
      .input("expressFee", sql.Decimal(18, 2), payload.expressFee)
      .input("samedayFee", sql.Decimal(18, 2), payload.samedayFee)
      .input("allowsSameday", sql.Bit, payload.allowsSameday)
      .input("freeShippingThreshold", sql.Decimal(18, 2), payload.freeShippingThreshold)
      .input("priority", sql.Int, payload.priority)
      .input("isActive", sql.Bit, payload.isActive)
      .query(
        `INSERT INTO ShippingZones (
           name, province, district,
           standard_fee, express_fee, sameday_fee,
           allows_sameday, free_shipping_threshold, priority, is_active
         )
         OUTPUT INSERTED.id
         VALUES (
           @name, @province, @district,
           @standardFee, @expressFee, @samedayFee,
           @allowsSameday, @freeShippingThreshold, @priority, @isActive
         )`
      );

    const id = Number(result.recordset[0]?.id);
    return res.status(201).json({
      id,
      message: "Đã tạo vùng vận chuyển.",
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

async function adminUpdateShippingZone(req, res, next) {
  try {
    const zoneId = Number(req.params.id);
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      return res.status(400).json({ message: "Mã vùng vận chuyển không hợp lệ." });
    }

    const payload = normalizeZonePayload(req.body);
    const pool = await getPool();

    const result = await pool
      .request()
      .input("id", sql.Int, zoneId)
      .input("name", sql.NVarChar, payload.name)
      .input("province", sql.NVarChar, payload.province)
      .input("district", sql.NVarChar, payload.district)
      .input("standardFee", sql.Decimal(18, 2), payload.standardFee)
      .input("expressFee", sql.Decimal(18, 2), payload.expressFee)
      .input("samedayFee", sql.Decimal(18, 2), payload.samedayFee)
      .input("allowsSameday", sql.Bit, payload.allowsSameday)
      .input("freeShippingThreshold", sql.Decimal(18, 2), payload.freeShippingThreshold)
      .input("priority", sql.Int, payload.priority)
      .input("isActive", sql.Bit, payload.isActive)
      .query(
        `UPDATE ShippingZones
         SET name = @name,
             province = @province,
             district = @district,
             standard_fee = @standardFee,
             express_fee = @expressFee,
             sameday_fee = @samedayFee,
             allows_sameday = @allowsSameday,
             free_shipping_threshold = @freeShippingThreshold,
             priority = @priority,
             is_active = @isActive,
             updated_at = GETDATE()
         WHERE id = @id`
      );

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: "Không tìm thấy vùng vận chuyển." });
    }

    return res.json({ message: "Đã cập nhật vùng vận chuyển." });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

async function adminDeleteShippingZone(req, res, next) {
  try {
    const zoneId = Number(req.params.id);
    if (!Number.isInteger(zoneId) || zoneId <= 0) {
      return res.status(400).json({ message: "Mã vùng vận chuyển không hợp lệ." });
    }

    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, zoneId)
      .query("DELETE FROM ShippingZones WHERE id = @id");

    if (!result.rowsAffected[0]) {
      return res.status(404).json({ message: "Không tìm thấy vùng vận chuyển." });
    }

    return res.json({ message: "Đã xóa vùng vận chuyển." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  quoteShipping,
  adminListShippingZones,
  adminGetShippingZoneById,
  adminCreateShippingZone,
  adminUpdateShippingZone,
  adminDeleteShippingZone,
};