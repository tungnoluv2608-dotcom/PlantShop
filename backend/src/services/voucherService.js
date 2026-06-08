const { sql } = require("../libs/db");
const { computeShippingFee: computeZoneShippingFee } = require("./shippingService");

const VALID_DISCOUNT_TYPES = new Set(["percent", "fixed", "freeship"]);
const VALID_APPLIES_TO = new Set(["all", "category", "product"]);

function normalizeVoucherCode(code) {
  return String(code || "").trim().toUpperCase();
}

function roundMoney(amount) {
  return Math.max(0, Math.round(Number(amount) * 100) / 100);
}

function mapVoucherRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    code: String(row.code || ""),
    name: String(row.name || ""),
    description: row.description ? String(row.description) : null,
    discountType: String(row.discountType || row.discount_type || ""),
    discountValue: Number(row.discountValue ?? row.discount_value ?? 0),
    maxDiscount: row.maxDiscount != null || row.max_discount != null
      ? Number(row.maxDiscount ?? row.max_discount)
      : null,
    minOrderValue: Number(row.minOrderValue ?? row.min_order_value ?? 0),
    usageLimit: row.usageLimit != null || row.usage_limit != null
      ? Number(row.usageLimit ?? row.usage_limit)
      : null,
    usagePerUser: Number(row.usagePerUser ?? row.usage_per_user ?? 1),
    startsAt: row.startsAt ?? row.starts_at,
    expiresAt: row.expiresAt ?? row.expires_at,
    isActive: Boolean(row.isActive ?? row.is_active),
    appliesTo: String(row.appliesTo ?? row.applies_to ?? "all"),
  };
}

function isItemEligible(item, voucher, scopeIds) {
  const appliesTo = String(voucher.appliesTo || "all").toLowerCase();
  if (appliesTo === "all") return true;
  if (appliesTo === "category") {
    return (
      item.itemType === "product" &&
      item.categoryId != null &&
      scopeIds.has(Number(item.categoryId))
    );
  }
  if (appliesTo === "product") {
    return item.itemType === "product" && scopeIds.has(Number(item.productId));
  }
  return false;
}

function computeEligibleSubtotal(canonicalItems, voucher, scopes) {
  const scopeIds = new Set(scopes.map((scope) => Number(scope.scopeId)));
  const appliesTo = String(voucher.appliesTo || "all").toLowerCase();

  if (appliesTo === "all") {
    return canonicalItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
      0
    );
  }

  const eligible = canonicalItems.reduce((sum, item) => {
    if (isItemEligible(item, voucher, scopeIds)) {
      return sum + Number(item.price || 0) * item.quantity;
    }
    return sum;
  }, 0);

  return roundMoney(eligible);
}

function computeDiscountAmount(eligibleSubtotal, voucher) {
  const type = String(voucher.discountType || "").toLowerCase();
  const value = Number(voucher.discountValue || 0);
  const maxDiscount = voucher.maxDiscount != null ? Number(voucher.maxDiscount) : null;
  const eligible = Number(eligibleSubtotal || 0);

  if (type === "freeship") return 0;
  if (type === "percent") {
    let discount = eligible * (value / 100);
    if (maxDiscount != null && Number.isFinite(maxDiscount)) {
      discount = Math.min(discount, maxDiscount);
    }
    return roundMoney(Math.min(discount, eligible));
  }
  if (type === "fixed") {
    return roundMoney(Math.min(value, eligible));
  }
  return 0;
}

function buildVoucherError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function loadVoucherScopes(request, voucherId) {
  const result = await request
    .input("voucherId", sql.Int, voucherId)
    .query(
      `SELECT scope_type AS scopeType, scope_id AS scopeId
       FROM VoucherScopes
       WHERE voucher_id = @voucherId`
    );
  return result.recordset.map((row) => ({
    scopeType: String(row.scopeType || ""),
    scopeId: Number(row.scopeId),
  }));
}

async function loadVoucherByCode(request, code, { lock = false } = {}) {
  const lockClause = lock ? "WITH (UPDLOCK, ROWLOCK)" : "";
  const result = await request.input("code", sql.NVarChar, code).query(
    `SELECT id, code, name, description,
            discount_type AS discountType, discount_value AS discountValue,
            max_discount AS maxDiscount, min_order_value AS minOrderValue,
            usage_limit AS usageLimit, usage_per_user AS usagePerUser,
            starts_at AS startsAt, expires_at AS expiresAt,
            is_active AS isActive, applies_to AS appliesTo
     FROM Vouchers ${lockClause}
     WHERE UPPER(LTRIM(RTRIM(code))) = @code`
  );
  return mapVoucherRow(result.recordset[0]);
}

async function countVoucherUsage(pool, voucherId, userId) {
  const totalResult = await pool
    .request()
    .input("voucherId", sql.Int, voucherId)
    .query(
      `SELECT COUNT(*) AS total
       FROM VoucherRedemptions vr
       INNER JOIN Orders o ON o.id = vr.order_id
       WHERE vr.voucher_id = @voucherId
         AND o.status <> 'cancelled'`
    );

  const userResult = await pool
    .request()
    .input("voucherId", sql.Int, voucherId)
    .input("userId", sql.Int, userId)
    .query(
      `SELECT COUNT(*) AS total
       FROM VoucherRedemptions vr
       INNER JOIN Orders o ON o.id = vr.order_id
       WHERE vr.voucher_id = @voucherId
         AND vr.user_id = @userId
         AND o.status <> 'cancelled'`
    );

  return {
    totalUsed: Number(totalResult.recordset[0]?.total || 0),
    userUsed: Number(userResult.recordset[0]?.total || 0),
  };
}

function checkVoucherSchedule(voucher, now = new Date()) {
  const startsAt = new Date(voucher.startsAt);
  const expiresAt = new Date(voucher.expiresAt);

  if (!voucher.isActive) {
    return "Mã voucher không còn hiệu lực.";
  }
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
    return "Cấu hình thời hạn voucher không hợp lệ.";
  }
  if (now < startsAt) {
    return "Mã voucher chưa đến thời gian áp dụng.";
  }
  if (now > expiresAt) {
    return "Mã voucher đã hết hạn.";
  }
  return null;
}

function assertVoucherSchedule(voucher, now = new Date()) {
  const reason = checkVoucherSchedule(voucher, now);
  if (reason) {
    throw buildVoucherError(reason);
  }
}

function resolveUserVoucherAvailability(voucher, usage) {
  const scheduleReason = checkVoucherSchedule(voucher);
  if (scheduleReason) {
    return {
      status: scheduleReason.includes("hết hạn") ? "expired" : "inactive",
      statusMessage: scheduleReason,
      canUse: false,
    };
  }
  if (voucher.usageLimit != null && usage.totalUsed >= voucher.usageLimit) {
    return {
      status: "depleted",
      statusMessage: "Mã đã hết lượt sử dụng.",
      canUse: false,
    };
  }
  if (usage.userUsed >= voucher.usagePerUser) {
    return {
      status: "used",
      statusMessage: "Bạn đã dùng hết lượt cho mã này.",
      canUse: false,
    };
  }
  return {
    status: "active",
    statusMessage: null,
    canUse: true,
  };
}

async function buildIneligiblePreview(
  pool,
  subtotal = 0,
  shippingMethod = "standard",
  address = {}
) {
  const { shippingFee } = await computeZoneShippingFee(pool, {
    subtotal,
    shippingMethod,
    province: address.province,
    district: address.district,
    ward: address.ward,
    throwOnUnavailable: false,
  });
  return {
    eligible: false,
    subtotal,
    eligibleSubtotal: 0,
    discountAmount: 0,
    shippingFee,
    total: roundMoney(subtotal + shippingFee),
    savings: 0,
  };
}

async function evaluateVoucherEligibility({
  pool,
  voucher,
  scopes,
  userId,
  canonicalItems,
  shippingMethod,
  province,
  district,
  ward,
  usage,
}) {
  const scheduleReason = checkVoucherSchedule(voucher);
  const subtotal = roundMoney(
    canonicalItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
      0
    )
  );

  const address = { province, district, ward };

  if (scheduleReason) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: scheduleReason,
    };
  }

  const appliesTo = String(voucher.appliesTo || "all").toLowerCase();
  if (appliesTo !== "all" && !scopes.length) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Voucher chưa được cấu hình phạm vi áp dụng.",
    };
  }

  const usageData =
    usage ?? (await countVoucherUsage(pool, voucher.id, userId));
  if (voucher.usageLimit != null && usageData.totalUsed >= voucher.usageLimit) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Mã voucher đã hết lượt sử dụng.",
    };
  }
  if (usageData.userUsed >= voucher.usagePerUser) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Bạn đã sử dụng hết lượt cho mã voucher này.",
    };
  }

  if (subtotal < Number(voucher.minOrderValue || 0)) {
    const gap = roundMoney(Number(voucher.minOrderValue) - subtotal);
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: `Cần thêm ${gap.toLocaleString("vi-VN")}đ để đủ điều kiện.`,
    };
  }

  const eligibleSubtotal = computeEligibleSubtotal(canonicalItems, voucher, scopes);
  if (appliesTo !== "all" && eligibleSubtotal <= 0) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Không có sản phẩm phù hợp trong giỏ để áp dụng mã này.",
    };
  }

  const discountAmount = computeDiscountAmount(eligibleSubtotal, voucher);
  const discountType = String(voucher.discountType || "").toLowerCase();

  if (discountType !== "freeship" && discountAmount <= 0) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Mã voucher không áp dụng được cho đơn hàng này.",
    };
  }

  const { shippingFee: baseShippingFee, unavailable } = await computeZoneShippingFee(pool, {
    subtotal,
    shippingMethod,
    province,
    district,
    ward,
    throwOnUnavailable: false,
  });

  if (unavailable) {
    return {
      ...(await buildIneligiblePreview(pool, subtotal, shippingMethod, address)),
      reason: "Giao hàng trong ngày không khả dụng cho địa chỉ này.",
    };
  }
  let shippingFee = baseShippingFee;
  if (discountType === "freeship") {
    shippingFee = 0;
  }

  const total = roundMoney(subtotal - discountAmount + shippingFee);
  const savings = roundMoney(discountAmount + Math.max(0, baseShippingFee - shippingFee));

  return {
    eligible: true,
    reason: null,
    subtotal,
    eligibleSubtotal,
    discountAmount,
    shippingFee,
    total,
    savings,
  };
}

async function loadActiveVouchers(request) {
  const result = await request.query(
    `SELECT id, code, name, description,
            discount_type AS discountType, discount_value AS discountValue,
            max_discount AS maxDiscount, min_order_value AS minOrderValue,
            usage_limit AS usageLimit, usage_per_user AS usagePerUser,
            CONVERT(varchar, starts_at, 126) AS startsAt,
            CONVERT(varchar, expires_at, 126) AS expiresAt,
            is_active AS isActive, applies_to AS appliesTo
     FROM Vouchers
     WHERE is_active = 1
       AND starts_at <= GETDATE()
       AND expires_at >= GETDATE()
     ORDER BY created_at DESC`
  );
  return result.recordset.map((row) => mapVoucherRow(row));
}

async function loadVoucherScopesMap(request, voucherIds) {
  const map = new Map();
  if (!voucherIds.length) return map;

  const result = await request.query(
    `SELECT voucher_id AS voucherId, scope_type AS scopeType, scope_id AS scopeId
     FROM VoucherScopes
     WHERE voucher_id IN (${voucherIds.join(",")})`
  );

  for (const row of result.recordset) {
    const key = Number(row.voucherId);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push({
      scopeType: String(row.scopeType || ""),
      scopeId: Number(row.scopeId),
    });
  }
  return map;
}

async function loadUserClaimedVoucherIds(request, userId) {
  if (!userId) return new Set();

  const result = await request
    .input("userId", sql.Int, userId)
    .query(
      `SELECT voucher_id AS voucherId
       FROM UserVoucherClaims
       WHERE user_id = @userId`
    );

  return new Set(result.recordset.map((row) => Number(row.voucherId)));
}

function formatPublicVoucherSummary(voucher) {
  const type = String(voucher.discountType || "").toLowerCase();
  if (type === "freeship") return "Miễn phí vận chuyển";
  if (type === "percent") {
    const cap = voucher.maxDiscount
      ? ` (tối đa ${Number(voucher.maxDiscount).toLocaleString("vi-VN")}đ)`
      : "";
    return `Giảm ${voucher.discountValue}%${cap}`;
  }
  return `Giảm ${Number(voucher.discountValue).toLocaleString("vi-VN")}đ`;
}

function pickRecommendedVoucherId(entries) {
  const eligible = entries.filter((entry) => entry.eligible);
  if (!eligible.length) return null;

  const best = eligible.reduce((current, candidate) =>
    Number(candidate.savings || 0) > Number(current.savings || 0) ? candidate : current
  );
  return best.id;
}

function assertVoucherUsageLimits(voucher, usage) {
  if (voucher.usageLimit != null && usage.totalUsed >= voucher.usageLimit) {
    throw buildVoucherError("Mã voucher đã hết lượt sử dụng.");
  }
  if (usage.userUsed >= voucher.usagePerUser) {
    throw buildVoucherError("Bạn đã sử dụng hết lượt cho mã voucher này.");
  }
}

function assertVoucherScopeConfiguration(voucher, scopes) {
  const appliesTo = String(voucher.appliesTo || "all").toLowerCase();
  if (appliesTo === "all") return;
  if (!scopes.length) {
    throw buildVoucherError("Voucher chưa được cấu hình phạm vi áp dụng.");
  }
}

async function validateVoucherForOrder({
  request,
  pool,
  code,
  userId,
  canonicalItems,
  shippingMethod,
  province,
  district,
  ward,
  lock = false,
}) {
  const normalizedCode = normalizeVoucherCode(code);
  if (!normalizedCode) {
    throw buildVoucherError("Vui lòng nhập mã voucher.");
  }

  const voucher = await loadVoucherByCode(request, normalizedCode, { lock });
  if (!voucher) {
    throw buildVoucherError("Mã voucher không tồn tại.");
  }

  const scopes = await loadVoucherScopes(request, voucher.id);
  assertVoucherSchedule(voucher);
  assertVoucherScopeConfiguration(voucher, scopes);

  const usage = await countVoucherUsage(pool, voucher.id, userId);
  assertVoucherUsageLimits(voucher, usage);

  const subtotal = roundMoney(
    canonicalItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * item.quantity,
      0
    )
  );

  if (subtotal < Number(voucher.minOrderValue || 0)) {
    throw buildVoucherError(
      `Đơn hàng tối thiểu ${Number(voucher.minOrderValue).toLocaleString("vi-VN")}đ để dùng mã này.`
    );
  }

  const eligibleSubtotal = computeEligibleSubtotal(canonicalItems, voucher, scopes);
  if (String(voucher.appliesTo || "all").toLowerCase() !== "all" && eligibleSubtotal <= 0) {
    throw buildVoucherError("Không có sản phẩm phù hợp trong giỏ để áp dụng mã này.");
  }

  const discountAmount = computeDiscountAmount(eligibleSubtotal, voucher);
  const discountType = String(voucher.discountType || "").toLowerCase();

  if (discountType !== "freeship" && discountAmount <= 0) {
    throw buildVoucherError("Mã voucher không áp dụng được cho đơn hàng này.");
  }

  const { shippingFee: computedShippingFee } = await computeZoneShippingFee(pool, {
    subtotal,
    shippingMethod,
    province,
    district,
    ward,
  });
  let shippingFee = computedShippingFee;
  if (discountType === "freeship") {
    shippingFee = 0;
  }

  const total = roundMoney(subtotal - discountAmount + shippingFee);

  return {
    voucher,
    scopes,
    subtotal,
    eligibleSubtotal,
    discountAmount,
    shippingFee,
    total,
    voucherCode: normalizedCode,
  };
}

async function calculateOrderTotalsWithVoucher(
  pool,
  canonicalItems,
  shippingMethod,
  voucherResult,
  address = {}
) {
  if (!voucherResult) {
    const subtotal = roundMoney(
      canonicalItems.reduce(
        (sum, item) => sum + Number(item.price || 0) * item.quantity,
        0
      )
    );
    const { shippingFee } = await computeZoneShippingFee(pool, {
      subtotal,
      shippingMethod,
      province: address.province,
      district: address.district,
      ward: address.ward,
    });
    return {
      subtotal,
      shippingFee,
      discountAmount: 0,
      total: roundMoney(subtotal + shippingFee),
      voucher: null,
      voucherCode: null,
    };
  }

  return {
    subtotal: voucherResult.subtotal,
    shippingFee: voucherResult.shippingFee,
    discountAmount: voucherResult.discountAmount,
    total: voucherResult.total,
    voucher: voucherResult.voucher,
    voucherCode: voucherResult.voucherCode,
  };
}

function validateAdminVoucherPayload(payload, { isUpdate = false } = {}) {
  const code = normalizeVoucherCode(payload.code);
  const name = String(payload.name || "").trim();
  const description = String(payload.description || "").trim() || null;
  const discountType = String(payload.discountType || "").trim().toLowerCase();
  const discountValue = Number(payload.discountValue);
  const maxDiscount = payload.maxDiscount === "" || payload.maxDiscount == null
    ? null
    : Number(payload.maxDiscount);
  const minOrderValue = Number(payload.minOrderValue ?? 0);
  const usageLimit = payload.usageLimit === "" || payload.usageLimit == null
    ? null
    : Number.parseInt(payload.usageLimit, 10);
  const usagePerUser = Number.parseInt(payload.usagePerUser ?? 1, 10);
  const startsAt = payload.startsAt ? new Date(payload.startsAt) : null;
  const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;
  const isActive = payload.isActive !== false;
  const appliesTo = String(payload.appliesTo || "all").trim().toLowerCase();
  const scopes = Array.isArray(payload.scopes) ? payload.scopes : [];

  if (!isUpdate && !code) {
    throw buildVoucherError("Mã voucher không được để trống.");
  }
  if (!name) {
    throw buildVoucherError("Tên voucher không được để trống.");
  }
  if (!VALID_DISCOUNT_TYPES.has(discountType)) {
    throw buildVoucherError("Loại giảm giá không hợp lệ.");
  }
  if (!Number.isFinite(discountValue) || discountValue < 0) {
    throw buildVoucherError("Giá trị giảm giá không hợp lệ.");
  }
  if (discountType === "percent" && (discountValue <= 0 || discountValue > 100)) {
    throw buildVoucherError("Phần trăm giảm giá phải từ 1 đến 100.");
  }
  if (discountType === "fixed" && discountValue <= 0) {
    throw buildVoucherError("Số tiền giảm phải lớn hơn 0.");
  }
  if (discountType === "freeship" && discountValue !== 0) {
    throw buildVoucherError("Voucher freeship không cần nhập giá trị giảm.");
  }
  if (maxDiscount != null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
    throw buildVoucherError("Giới hạn giảm tối đa không hợp lệ.");
  }
  if (!Number.isFinite(minOrderValue) || minOrderValue < 0) {
    throw buildVoucherError("Giá trị đơn tối thiểu không hợp lệ.");
  }
  if (usageLimit != null && (!Number.isInteger(usageLimit) || usageLimit <= 0)) {
    throw buildVoucherError("Giới hạn lượt dùng không hợp lệ.");
  }
  if (!Number.isInteger(usagePerUser) || usagePerUser <= 0) {
    throw buildVoucherError("Lượt dùng mỗi khách không hợp lệ.");
  }
  if (!startsAt || !expiresAt || Number.isNaN(startsAt.getTime()) || Number.isNaN(expiresAt.getTime())) {
    throw buildVoucherError("Thời gian bắt đầu/kết thúc không hợp lệ.");
  }
  if (startsAt >= expiresAt) {
    throw buildVoucherError("Thời gian kết thúc phải sau thời gian bắt đầu.");
  }
  if (!VALID_APPLIES_TO.has(appliesTo)) {
    throw buildVoucherError("Phạm vi áp dụng không hợp lệ.");
  }

  const normalizedScopes = [];
  if (appliesTo !== "all") {
    const expectedType = appliesTo === "category" ? "category" : "product";
    for (const scope of scopes) {
      const scopeId = Number(scope?.scopeId ?? scope?.id);
      const scopeType = String(scope?.scopeType || expectedType).toLowerCase();
      if (!Number.isInteger(scopeId) || scopeId <= 0) continue;
      if (scopeType !== expectedType) {
        throw buildVoucherError("Phạm vi voucher không khớp loại áp dụng.");
      }
      normalizedScopes.push({ scopeType, scopeId });
    }
    if (normalizedScopes.length === 0) {
      throw buildVoucherError("Vui lòng chọn ít nhất một danh mục hoặc sản phẩm.");
    }
  }

  return {
    code,
    name,
    description,
    discountType,
    discountValue: discountType === "freeship" ? 0 : discountValue,
    maxDiscount: discountType === "percent" ? maxDiscount : null,
    minOrderValue,
    usageLimit,
    usagePerUser,
    startsAt,
    expiresAt,
    isActive,
    appliesTo,
    scopes: normalizedScopes,
  };
}

module.exports = {
  VALID_DISCOUNT_TYPES,
  VALID_APPLIES_TO,
  normalizeVoucherCode,
  roundMoney,
  mapVoucherRow,
  loadVoucherScopes,
  loadVoucherByCode,
  countVoucherUsage,
  validateVoucherForOrder,
  calculateOrderTotalsWithVoucher,
  validateAdminVoucherPayload,
  computeEligibleSubtotal,
  computeDiscountAmount,
  checkVoucherSchedule,
  resolveUserVoucherAvailability,
  evaluateVoucherEligibility,
  loadActiveVouchers,
  loadVoucherScopesMap,
  loadUserClaimedVoucherIds,
  formatPublicVoucherSummary,
  pickRecommendedVoucherId,
};