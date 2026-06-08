const { sql } = require("../libs/db");

const VALID_SHIPPING_METHODS = new Set(["standard", "express", "sameday"]);
const SHIPPING_STANDARD_FREE_THRESHOLD = Number(
  process.env.SHIPPING_STANDARD_FREE_THRESHOLD || 500000
);

const FALLBACK_FEES = {
  standard: Number(process.env.SHIPPING_STANDARD_FEE || 30000),
  express: Number(process.env.SHIPPING_EXPRESS_FEE || 30000),
  sameday: Number(process.env.SHIPPING_SAMEDAY_FEE || 60000),
};

const PROVINCE_ALIASES = {
  "tp.hcm": "tp. ho chi minh",
  "tp hcm": "tp. ho chi minh",
  "tp. hcm": "tp. ho chi minh",
  "ho chi minh": "tp. ho chi minh",
  "tp ho chi minh": "tp. ho chi minh",
  "sai gon": "tp. ho chi minh",
  "saigon": "tp. ho chi minh",
  "hn": "ha noi",
  "ha noi": "ha noi",
};

function roundMoney(amount) {
  return Math.max(0, Math.round(Number(amount) * 100) / 100);
}

function normalizeShippingMethod(method) {
  const normalized = String(method || "").trim().toLowerCase();
  return VALID_SHIPPING_METHODS.has(normalized) ? normalized : "";
}

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function normalizeLocationText(value) {
  const stripped = stripDiacritics(String(value || "").trim().toLowerCase());
  return stripped.replace(/\s+/g, " ");
}

function normalizeProvince(province) {
  const normalized = normalizeLocationText(province);
  return PROVINCE_ALIASES[normalized] || normalized;
}

function normalizeDistrict(district) {
  return normalizeLocationText(district);
}

function mapZoneRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: String(row.name || ""),
    province: row.province ? String(row.province) : null,
    district: row.district ? String(row.district) : null,
    standardFee: Number(row.standardFee ?? row.standard_fee ?? 0),
    expressFee: Number(row.expressFee ?? row.express_fee ?? 0),
    samedayFee: Number(row.samedayFee ?? row.sameday_fee ?? 0),
    allowsSameday: Boolean(row.allowsSameday ?? row.allows_sameday),
    freeShippingThreshold:
      row.freeShippingThreshold != null || row.free_shipping_threshold != null
        ? Number(row.freeShippingThreshold ?? row.free_shipping_threshold)
        : null,
    priority: Number(row.priority ?? 0),
    isActive: Boolean(row.isActive ?? row.is_active ?? true),
    createdAt: row.createdAt ?? row.created_at ?? null,
    updatedAt: row.updatedAt ?? row.updated_at ?? null,
  };
}

function buildFallbackZone() {
  return {
    id: null,
    name: "Mặc định (cấu hình hệ thống)",
    province: null,
    district: null,
    standardFee: FALLBACK_FEES.standard,
    expressFee: FALLBACK_FEES.express,
    samedayFee: FALLBACK_FEES.sameday,
    allowsSameday: false,
    freeShippingThreshold: SHIPPING_STANDARD_FREE_THRESHOLD,
    priority: 0,
    isActive: true,
  };
}

function matchZoneFromList(zones, province, district) {
  const normProvince = normalizeProvince(province);
  const normDistrict = normalizeDistrict(district);

  if (normProvince && normDistrict) {
    const districtMatch = zones.find(
      (zone) =>
        zone.province &&
        normalizeProvince(zone.province) === normProvince &&
        zone.district &&
        normalizeDistrict(zone.district) === normDistrict
    );
    if (districtMatch) return districtMatch;
  }

  if (normProvince) {
    const provinceMatch = zones.find(
      (zone) =>
        zone.province &&
        normalizeProvince(zone.province) === normProvince &&
        !zone.district
    );
    if (provinceMatch) return provinceMatch;
  }

  const fallback = zones.find((zone) => !zone.province && !zone.district);
  return fallback || null;
}

async function loadActiveShippingZones(pool) {
  const result = await pool.request().query(
    `SELECT id, name, province, district,
            standard_fee AS standardFee, express_fee AS expressFee,
            sameday_fee AS samedayFee, allows_sameday AS allowsSameday,
            free_shipping_threshold AS freeShippingThreshold,
            priority, is_active AS isActive,
            created_at AS createdAt, updated_at AS updatedAt
     FROM ShippingZones
     WHERE is_active = 1
     ORDER BY priority DESC, id ASC`
  );
  return result.recordset.map(mapZoneRow);
}

async function loadAllShippingZones(pool) {
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
  return result.recordset.map(mapZoneRow);
}

async function resolveShippingZone(pool, { province, district } = {}) {
  const zones = await loadActiveShippingZones(pool);
  const matched = matchZoneFromList(zones, province, district);
  return matched || buildFallbackZone();
}

function getMethodFee(zone, shippingMethod) {
  if (shippingMethod === "express") {
    return Number(zone.expressFee || 0);
  }
  if (shippingMethod === "sameday") {
    return Number(zone.samedayFee || 0);
  }
  return Number(zone.standardFee || 0);
}

function buildShippingUnavailableError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function computeShippingFee(
  pool,
  { subtotal = 0, shippingMethod, province, district, throwOnUnavailable = true } = {}
) {
  const normalizedMethod = normalizeShippingMethod(shippingMethod);
  if (!normalizedMethod) {
    throw buildShippingUnavailableError("Phương thức vận chuyển không hợp lệ.");
  }

  const zone = await resolveShippingZone(pool, { province, district });

  if (normalizedMethod === "sameday" && !zone.allowsSameday) {
    if (!throwOnUnavailable) {
      return {
        shippingFee: 0,
        zone: {
          id: zone.id,
          name: zone.name,
          allowsSameday: zone.allowsSameday,
          freeShippingThreshold:
            zone.freeShippingThreshold != null
              ? Number(zone.freeShippingThreshold)
              : SHIPPING_STANDARD_FREE_THRESHOLD,
        },
        allowsSameday: false,
        unavailable: true,
        standardFee: roundMoney(zone.standardFee),
        expressFee: roundMoney(zone.expressFee),
        samedayFee: roundMoney(zone.samedayFee),
      };
    }
    throw buildShippingUnavailableError(
      "Giao hàng trong ngày không khả dụng cho địa chỉ này."
    );
  }

  let fee = getMethodFee(zone, normalizedMethod);
  const threshold =
    zone.freeShippingThreshold != null
      ? Number(zone.freeShippingThreshold)
      : SHIPPING_STANDARD_FREE_THRESHOLD;

  if (normalizedMethod === "standard" && Number(subtotal) >= threshold) {
    fee = 0;
  }

  return {
    shippingFee: roundMoney(fee),
    zone: {
      id: zone.id,
      name: zone.name,
      allowsSameday: zone.allowsSameday,
      freeShippingThreshold: threshold,
    },
    allowsSameday: zone.allowsSameday,
    standardFee: roundMoney(zone.standardFee),
    expressFee: roundMoney(zone.expressFee),
    samedayFee: roundMoney(zone.samedayFee),
  };
}

async function getShippingQuote(pool, input = {}) {
  const subtotal = roundMoney(input.subtotal ?? 0);
  const shippingMethod = normalizeShippingMethod(input.shippingMethod) || "standard";
  const zone = await resolveShippingZone(pool, {
    province: input.province,
    district: input.district,
  });

  const methods = ["standard", "express", "sameday"].map((method) => {
    let available = true;
    let reason = null;
    let fee = getMethodFee(zone, method);
    const threshold =
      zone.freeShippingThreshold != null
        ? Number(zone.freeShippingThreshold)
        : SHIPPING_STANDARD_FREE_THRESHOLD;

    if (method === "sameday" && !zone.allowsSameday) {
      available = false;
      reason = "Không hỗ trợ giao trong ngày tại khu vực này.";
      fee = 0;
    } else if (method === "standard" && subtotal >= threshold) {
      fee = 0;
    }

    return {
      method,
      fee: roundMoney(fee),
      available,
      reason,
    };
  });

  const selected = methods.find((entry) => entry.method === shippingMethod) || methods[0];

  return {
    subtotal,
    shippingMethod,
    shippingFee: selected.available ? selected.fee : 0,
    total: roundMoney(subtotal + (selected.available ? selected.fee : 0)),
    zone: {
      id: zone.id,
      name: zone.name,
      allowsSameday: zone.allowsSameday,
      freeShippingThreshold:
        zone.freeShippingThreshold != null
          ? Number(zone.freeShippingThreshold)
          : SHIPPING_STANDARD_FREE_THRESHOLD,
    },
    methods,
    allowsSameday: zone.allowsSameday,
  };
}

function normalizeOptionalMoney(value) {
  if (value === "" || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw buildShippingUnavailableError("Giá trị tiền tệ không hợp lệ.");
  }
  return roundMoney(parsed);
}

function normalizeZonePayload(body, { partial = false } = {}) {
  const has = (key) => Object.prototype.hasOwnProperty.call(body || {}, key);

  if (!partial || has("name")) {
    const name = String(body?.name || "").trim();
    if (!name) {
      throw buildShippingUnavailableError("Tên vùng vận chuyển không được để trống.");
    }
  }

  const provinceRaw = has("province") ? body.province : undefined;
  const districtRaw = has("district") ? body.district : undefined;

  const province =
    provinceRaw == null || String(provinceRaw).trim() === ""
      ? null
      : String(provinceRaw).trim();
  const district =
    districtRaw == null || String(districtRaw).trim() === ""
      ? null
      : String(districtRaw).trim();

  if (district && !province) {
    throw buildShippingUnavailableError(
      "Cần chọn tỉnh/thành trước khi chỉ định quận/huyện."
    );
  }

  return {
    name: String(body?.name || "").trim(),
    province,
    district,
    standardFee: normalizeOptionalMoney(body?.standardFee ?? 0),
    expressFee: normalizeOptionalMoney(body?.expressFee ?? 0),
    samedayFee: normalizeOptionalMoney(body?.samedayFee ?? 0),
    allowsSameday: Boolean(body?.allowsSameday),
    freeShippingThreshold: has("freeShippingThreshold")
      ? normalizeOptionalMoney(body.freeShippingThreshold)
      : null,
    priority: Number.isFinite(Number(body?.priority)) ? Number(body.priority) : 0,
    isActive: body?.isActive !== false,
  };
}

module.exports = {
  VALID_SHIPPING_METHODS,
  normalizeShippingMethod,
  normalizeProvince,
  normalizeDistrict,
  mapZoneRow,
  roundMoney,
  loadActiveShippingZones,
  loadAllShippingZones,
  resolveShippingZone,
  computeShippingFee,
  getShippingQuote,
  normalizeZonePayload,
  buildFallbackZone,
};