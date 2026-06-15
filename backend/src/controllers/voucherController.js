const { getPool, sql } = require("../libs/db");
const {
  normalizeVoucherCode,
  mapVoucherRow,
  loadVoucherScopes,
  countVoucherUsage,
  validateVoucherForOrder,
  validateAdminVoucherPayload,
  evaluateVoucherEligibility,
  loadActiveVouchers,
  loadVoucherScopesMap,
  loadUserClaimedVoucherIds,
  formatPublicVoucherSummary,
  pickRecommendedVoucherId,
  checkVoucherSchedule,
  resolveUserVoucherAvailability,
} = require("../services/voucherService");
const {
  normalizeIncomingItems,
  loadCatalogMaps,
  buildCanonicalOrderItems,
  normalizeShippingMethod,
} = require("./orderController");

async function replaceVoucherScopes(transaction, voucherId, scopes) {
  await transaction
    .request()
    .input("voucherId", sql.Int, voucherId)
    .query("DELETE FROM VoucherScopes WHERE voucher_id = @voucherId");

  for (const scope of scopes) {
    await transaction
      .request()
      .input("voucherId", sql.Int, voucherId)
      .input("scopeType", sql.NVarChar, scope.scopeType)
      .input("scopeId", sql.Int, scope.scopeId)
      .query(
        `INSERT INTO VoucherScopes (voucher_id, scope_type, scope_id)
         VALUES (@voucherId, @scopeType, @scopeId)`
      );
  }
}

async function enrichVoucherList(pool, rows) {
  if (!rows.length) return [];

  const ids = rows.map((row) => Number(row.id));
  const scopeResult = await pool.request().query(
    `SELECT voucher_id AS voucherId, scope_type AS scopeType, scope_id AS scopeId
     FROM VoucherScopes
     WHERE voucher_id IN (${ids.join(",")})`
  );

  const usageResult = await pool.request().query(
    `SELECT vr.voucher_id AS voucherId, COUNT(*) AS usedCount
     FROM VoucherRedemptions vr
     INNER JOIN Orders o ON o.id = vr.order_id
     WHERE vr.voucher_id IN (${ids.join(",")})
       AND o.status <> 'cancelled'
     GROUP BY vr.voucher_id`
  );

  const scopesMap = new Map();
  for (const scope of scopeResult.recordset) {
    const key = Number(scope.voucherId);
    if (!scopesMap.has(key)) scopesMap.set(key, []);
    scopesMap.get(key).push({
      scopeType: String(scope.scopeType),
      scopeId: Number(scope.scopeId),
    });
  }

  const usageMap = new Map(
    usageResult.recordset.map((row) => [Number(row.voucherId), Number(row.usedCount)])
  );

  return rows.map((row) => {
    const voucher = mapVoucherRow(row);
    return {
      ...voucher,
      scopes: scopesMap.get(voucher.id) || [],
      usedCount: usageMap.get(voucher.id) || 0,
    };
  });
}

async function buildCanonicalCartContext(items) {
  const normalizedItems = normalizeIncomingItems(items);
  const pool = await getPool();
  const { productMap, planterMap } = await loadCatalogMaps(pool, normalizedItems);
  const canonicalItems = buildCanonicalOrderItems(normalizedItems, productMap, planterMap);
  return { pool, canonicalItems };
}

function mapAvailableVoucherEntry(voucher, evaluation, claimedIds) {
  return {
    id: voucher.id,
    code: voucher.code,
    name: voucher.name,
    description: voucher.description,
    discountType: voucher.discountType,
    discountLabel: formatPublicVoucherSummary(voucher),
    minOrderValue: voucher.minOrderValue,
    appliesTo: voucher.appliesTo,
    expiresAt: voucher.expiresAt,
    isClaimed: claimedIds.has(voucher.id),
    eligible: evaluation.eligible,
    reason: evaluation.reason,
    discountAmount: evaluation.discountAmount,
    shippingFee: evaluation.shippingFee,
    total: evaluation.total,
    savings: evaluation.savings,
    recommended: false,
  };
}

// GET /api/vouchers/promotions
async function listPromotions(req, res, next) {
  try {
    const pool = await getPool();
    const request = pool.request();
    const vouchers = await loadActiveVouchers(request);
    const claimedIds = await loadUserClaimedVoucherIds(request, req.user?.id ?? null);
    const userId = req.user?.id ?? null;

    const rows = await Promise.all(
      vouchers.slice(0, 12).map(async (voucher) => {
        const isClaimed = claimedIds.has(voucher.id);
        let canUse = true;
        let claimStatus = null;
        let statusMessage = null;

        if (userId) {
          const usage = await countVoucherUsage(pool, voucher.id, userId);
          const availability = resolveUserVoucherAvailability(voucher, usage);
          canUse = availability.canUse;
          claimStatus = availability.status;
          statusMessage = availability.statusMessage;
        }

        return {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          discountType: voucher.discountType,
          discountLabel: formatPublicVoucherSummary(voucher),
          minOrderValue: voucher.minOrderValue,
          expiresAt: voucher.expiresAt,
          isClaimed,
          canUse,
          claimStatus,
          statusMessage,
        };
      })
    );

    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/vouchers/wallet
async function getWallet(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT v.id, v.code, v.name, v.description,
                v.discount_type AS discountType, v.discount_value AS discountValue,
                v.max_discount AS maxDiscount, v.min_order_value AS minOrderValue,
                v.usage_limit AS usageLimit, v.usage_per_user AS usagePerUser,
                CONVERT(varchar, v.starts_at, 126) AS startsAt,
                CONVERT(varchar, v.expires_at, 126) AS expiresAt,
                v.is_active AS isActive, v.applies_to AS appliesTo,
                CONVERT(varchar, c.claimed_at, 126) AS claimedAt
         FROM UserVoucherClaims c
         INNER JOIN Vouchers v ON v.id = c.voucher_id
         WHERE c.user_id = @userId
         ORDER BY c.claimed_at DESC`
      );

    const rows = await Promise.all(
      result.recordset.map(async (row) => {
        const voucher = mapVoucherRow(row);
        const usage = await countVoucherUsage(pool, voucher.id, req.user.id);
        const { status, statusMessage } = resolveUserVoucherAvailability(voucher, usage);

        return {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          description: voucher.description,
          discountType: voucher.discountType,
          discountLabel: formatPublicVoucherSummary(voucher),
          minOrderValue: voucher.minOrderValue,
          expiresAt: voucher.expiresAt,
          claimedAt: row.claimedAt,
          status,
          statusMessage,
        };
      })
    );

    return res.json(rows);
  } catch (err) {
    next(err);
  }
}

// POST /api/vouchers/available
async function listAvailableVouchers(req, res, next) {
  try {
    const items = req.body?.items;
    const shippingMethod = normalizeShippingMethod(req.body?.shippingMethod);
    const province = String(req.body?.province || "").trim();
    const district = String(req.body?.district || "").trim() || null;
    const ward = String(req.body?.ward || "").trim() || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống." });
    }
    if (!shippingMethod) {
      return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ." });
    }
    if (!province) {
      return res.status(400).json({ message: "Vui lòng chọn tỉnh/thành giao hàng." });
    }

    const { pool, canonicalItems } = await buildCanonicalCartContext(items);
    const request = pool.request();
    const vouchers = await loadActiveVouchers(request);
    const voucherIds = vouchers.map((voucher) => voucher.id);
    const scopesMap = await loadVoucherScopesMap(request, voucherIds);
    const claimedIds = await loadUserClaimedVoucherIds(request, req.user.id);

    const entries = [];
    for (const voucher of vouchers) {
      const scopes = scopesMap.get(voucher.id) || [];
      const evaluation = await evaluateVoucherEligibility({
        pool,
        voucher,
        scopes,
        userId: req.user.id,
        canonicalItems,
        shippingMethod,
        province,
        district,
        ward,
      });
      entries.push(mapAvailableVoucherEntry(voucher, evaluation, claimedIds));
    }

    entries.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      if (a.isClaimed !== b.isClaimed) return a.isClaimed ? -1 : 1;
      return Number(b.savings || 0) - Number(a.savings || 0);
    });

    const recommendedId = pickRecommendedVoucherId(entries);
    const vouchersWithRecommendation = entries.map((entry) => ({
      ...entry,
      recommended: entry.id === recommendedId,
    }));

    const recommended = vouchersWithRecommendation.find((entry) => entry.recommended) ?? null;

    return res.json({
      vouchers: vouchersWithRecommendation,
      recommended,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// POST /api/vouchers/:id/claim
async function claimVoucher(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "Mã voucher không hợp lệ." });
    }

    const pool = await getPool();
    const voucherResult = await pool
      .request()
      .input("id", sql.Int, voucherId)
      .query(
        `SELECT id, code, name, description,
                discount_type AS discountType, discount_value AS discountValue,
                max_discount AS maxDiscount, min_order_value AS minOrderValue,
                usage_limit AS usageLimit, usage_per_user AS usagePerUser,
                CONVERT(varchar, starts_at, 126) AS startsAt,
                CONVERT(varchar, expires_at, 126) AS expiresAt,
                is_active AS isActive, applies_to AS appliesTo
         FROM Vouchers
         WHERE id = @id`
      );

    if (!voucherResult.recordset.length) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    const voucher = mapVoucherRow(voucherResult.recordset[0]);
    const scheduleReason = checkVoucherSchedule(voucher);
    if (scheduleReason) {
      return res.status(400).json({ message: scheduleReason });
    }

    const existing = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("voucherId", sql.Int, voucherId)
      .query(
        `SELECT id FROM UserVoucherClaims
         WHERE user_id = @userId AND voucher_id = @voucherId`
      );

    if (existing.recordset.length > 0) {
      return res.json({
        message: "Bạn đã lưu mã voucher này rồi.",
        code: voucher.code,
        alreadyClaimed: true,
      });
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("voucherId", sql.Int, voucherId)
      .query(
        `INSERT INTO UserVoucherClaims (user_id, voucher_id)
         VALUES (@userId, @voucherId)`
      );

    return res.status(201).json({
      message: `Đã lưu mã ${voucher.code} vào kho voucher.`,
      code: voucher.code,
      alreadyClaimed: false,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/vouchers/validate
async function validateVoucher(req, res, next) {
  try {
    const code = req.body?.code;
    const items = req.body?.items;
    const shippingMethod = normalizeShippingMethod(req.body?.shippingMethod);
    const province = String(req.body?.province || "").trim();
    const district = String(req.body?.district || "").trim() || null;
    const ward = String(req.body?.ward || "").trim() || null;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng trống." });
    }
    if (!shippingMethod) {
      return res.status(400).json({ message: "Phương thức vận chuyển không hợp lệ." });
    }
    if (!province) {
      return res.status(400).json({ message: "Vui lòng chọn tỉnh/thành giao hàng." });
    }

    const normalizedItems = normalizeIncomingItems(items);
    const pool = await getPool();
    const { productMap, planterMap } = await loadCatalogMaps(pool, normalizedItems);
    const canonicalItems = buildCanonicalOrderItems(normalizedItems, productMap, planterMap);

    const result = await validateVoucherForOrder({
      request: pool.request(),
      pool,
      code,
      userId: req.user.id,
      canonicalItems,
      shippingMethod,
      province,
      district,
      ward,
    });

    return res.json({
      valid: true,
      message: "Áp dụng voucher thành công.",
      code: result.voucherCode,
      voucherName: result.voucher.name,
      discountType: result.voucher.discountType,
      subtotal: result.subtotal,
      eligibleSubtotal: result.eligibleSubtotal,
      discountAmount: result.discountAmount,
      shippingFee: result.shippingFee,
      total: result.total,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message, valid: false });
    }
    next(err);
  }
}

// GET /api/admin/vouchers
async function adminListVouchers(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool.request().query(
      `SELECT id, code, name, description,
              discount_type AS discountType, discount_value AS discountValue,
              max_discount AS maxDiscount, min_order_value AS minOrderValue,
              usage_limit AS usageLimit, usage_per_user AS usagePerUser,
              CONVERT(varchar, starts_at, 126) AS startsAt,
              CONVERT(varchar, expires_at, 126) AS expiresAt,
              is_active AS isActive, applies_to AS appliesTo,
              CONVERT(varchar, created_at, 126) AS createdAt
       FROM Vouchers
       ORDER BY created_at DESC`
    );

    const vouchers = await enrichVoucherList(pool, result.recordset);
    return res.json(vouchers);
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/vouchers/:id
async function adminGetVoucherById(req, res, next) {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("id", sql.Int, req.params.id)
      .query(
        `SELECT id, code, name, description,
                discount_type AS discountType, discount_value AS discountValue,
                max_discount AS maxDiscount, min_order_value AS minOrderValue,
                usage_limit AS usageLimit, usage_per_user AS usagePerUser,
                CONVERT(varchar, starts_at, 126) AS startsAt,
                CONVERT(varchar, expires_at, 126) AS expiresAt,
                is_active AS isActive, applies_to AS appliesTo,
                CONVERT(varchar, created_at, 126) AS createdAt
         FROM Vouchers
         WHERE id = @id`
      );

    if (!result.recordset.length) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    const [voucher] = await enrichVoucherList(pool, result.recordset);
    return res.json(voucher);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/vouchers
async function adminCreateVoucher(req, res, next) {
  let transaction;

  try {
    const payload = validateAdminVoucherPayload(req.body);
    const pool = await getPool();

    const duplicate = await pool
      .request()
      .input("code", sql.NVarChar, payload.code)
      .query("SELECT id FROM Vouchers WHERE UPPER(LTRIM(RTRIM(code))) = @code");

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({ message: "Mã voucher đã tồn tại." });
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    const insertResult = await transaction
      .request()
      .input("code", sql.NVarChar, payload.code)
      .input("name", sql.NVarChar, payload.name)
      .input("description", sql.NVarChar, payload.description)
      .input("discountType", sql.NVarChar, payload.discountType)
      .input("discountValue", sql.Decimal(18, 2), payload.discountValue)
      .input("maxDiscount", sql.Decimal(18, 2), payload.maxDiscount)
      .input("minOrderValue", sql.Decimal(18, 2), payload.minOrderValue)
      .input("usageLimit", sql.Int, payload.usageLimit)
      .input("usagePerUser", sql.Int, payload.usagePerUser)
      .input("startsAt", sql.NVarChar, payload.startsAt)
      .input("expiresAt", sql.NVarChar, payload.expiresAt)
      .input("isActive", sql.Bit, payload.isActive)
      .input("appliesTo", sql.NVarChar, payload.appliesTo)
      .query(
        `INSERT INTO Vouchers (
           code, name, description, discount_type, discount_value, max_discount,
           min_order_value, usage_limit, usage_per_user, starts_at, expires_at,
           is_active, applies_to
         )
         OUTPUT INSERTED.id
         VALUES (
           @code, @name, @description, @discountType, @discountValue, @maxDiscount,
           @minOrderValue, @usageLimit, @usagePerUser,
           CAST(@startsAt AS DATETIME), CAST(@expiresAt AS DATETIME),
           @isActive, @appliesTo
         )`
      );

    const voucherId = Number(insertResult.recordset[0]?.id);
    await replaceVoucherScopes(transaction, voucherId, payload.scopes);
    await transaction.commit();

    return res.status(201).json({ message: "Tạo voucher thành công.", id: voucherId });
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {
        // ignore rollback errors
      }
    }
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// PUT /api/admin/vouchers/:id
async function adminUpdateVoucher(req, res, next) {
  let transaction;

  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "Mã voucher không hợp lệ." });
    }

    const payload = validateAdminVoucherPayload(req.body, { isUpdate: true });
    const pool = await getPool();

    const existing = await pool
      .request()
      .input("id", sql.Int, voucherId)
      .query("SELECT id, code FROM Vouchers WHERE id = @id");

    if (!existing.recordset.length) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    const nextCode = payload.code || normalizeVoucherCode(existing.recordset[0].code);
    const duplicate = await pool
      .request()
      .input("code", sql.NVarChar, nextCode)
      .input("id", sql.Int, voucherId)
      .query(
        `SELECT id FROM Vouchers
         WHERE UPPER(LTRIM(RTRIM(code))) = @code AND id <> @id`
      );

    if (duplicate.recordset.length > 0) {
      return res.status(409).json({ message: "Mã voucher đã tồn tại." });
    }

    transaction = new sql.Transaction(pool);
    await transaction.begin();

    await transaction
      .request()
      .input("id", sql.Int, voucherId)
      .input("code", sql.NVarChar, nextCode)
      .input("name", sql.NVarChar, payload.name)
      .input("description", sql.NVarChar, payload.description)
      .input("discountType", sql.NVarChar, payload.discountType)
      .input("discountValue", sql.Decimal(18, 2), payload.discountValue)
      .input("maxDiscount", sql.Decimal(18, 2), payload.maxDiscount)
      .input("minOrderValue", sql.Decimal(18, 2), payload.minOrderValue)
      .input("usageLimit", sql.Int, payload.usageLimit)
      .input("usagePerUser", sql.Int, payload.usagePerUser)
      .input("startsAt", sql.NVarChar, payload.startsAt)
      .input("expiresAt", sql.NVarChar, payload.expiresAt)
      .input("isActive", sql.Bit, payload.isActive)
      .input("appliesTo", sql.NVarChar, payload.appliesTo)
      .query(
        `UPDATE Vouchers SET
           code = @code,
           name = @name,
           description = @description,
           discount_type = @discountType,
           discount_value = @discountValue,
           max_discount = @maxDiscount,
           min_order_value = @minOrderValue,
           usage_limit = @usageLimit,
           usage_per_user = @usagePerUser,
           starts_at = CAST(@startsAt AS DATETIME),
           expires_at = CAST(@expiresAt AS DATETIME),
           is_active = @isActive,
           applies_to = @appliesTo,
           updated_at = GETDATE()
         WHERE id = @id`
      );

    await replaceVoucherScopes(transaction, voucherId, payload.scopes);
    await transaction.commit();

    return res.json({ message: "Cập nhật voucher thành công." });
  } catch (err) {
    if (transaction) {
      try {
        await transaction.rollback();
      } catch {
        // ignore rollback errors
      }
    }
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

// DELETE /api/admin/vouchers/:id
async function adminDeleteVoucher(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "Mã voucher không hợp lệ." });
    }

    const pool = await getPool();
    const usage = await countVoucherUsage(pool, voucherId, 0);

    if (usage.totalUsed > 0) {
      await pool
        .request()
        .input("id", sql.Int, voucherId)
        .query("UPDATE Vouchers SET is_active = 0, updated_at = GETDATE() WHERE id = @id");
      return res.json({ message: "Voucher đã được vô hiệu hóa vì đã có lượt sử dụng." });
    }

    await pool.request().input("id", sql.Int, voucherId).query("DELETE FROM Vouchers WHERE id = @id");
    return res.json({ message: "Xóa voucher thành công." });
  } catch (err) {
    next(err);
  }
}

// GET /api/admin/vouchers/:id/redemptions
async function adminListVoucherRedemptions(req, res, next) {
  try {
    const voucherId = Number(req.params.id);
    if (!Number.isInteger(voucherId) || voucherId <= 0) {
      return res.status(400).json({ message: "Mã voucher không hợp lệ." });
    }

    const pool = await getPool();
    const voucher = await pool
      .request()
      .input("id", sql.Int, voucherId)
      .query("SELECT id, code, name FROM Vouchers WHERE id = @id");

    if (!voucher.recordset.length) {
      return res.status(404).json({ message: "Voucher không tồn tại." });
    }

    const result = await pool
      .request()
      .input("voucherId", sql.Int, voucherId)
      .query(
        `SELECT vr.id,
                vr.order_id AS orderId,
                vr.discount_amount AS discountAmount,
                CONVERT(varchar, vr.redeemed_at, 120) AS redeemedAt,
                u.name AS customerName,
                u.email AS customerEmail,
                o.status AS orderStatus,
                o.total AS orderTotal
         FROM VoucherRedemptions vr
         INNER JOIN Users u ON u.id = vr.user_id
         LEFT JOIN Orders o ON o.id = vr.order_id
         WHERE vr.voucher_id = @voucherId
         ORDER BY vr.redeemed_at DESC`
      );

    const usage = await countVoucherUsage(pool, voucherId, 0);
    const scopes = await loadVoucherScopes(pool.request(), voucherId);

    return res.json({
      voucher: voucher.recordset[0],
      scopes,
      summary: {
        totalUsed: usage.totalUsed,
        totalDiscount: result.recordset.reduce(
          (sum, row) => sum + Number(row.discountAmount || 0),
          0
        ),
      },
      redemptions: result.recordset,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listPromotions,
  getWallet,
  listAvailableVouchers,
  claimVoucher,
  validateVoucher,
  adminListVouchers,
  adminGetVoucherById,
  adminCreateVoucher,
  adminUpdateVoucher,
  adminDeleteVoucher,
  adminListVoucherRedemptions,
};