const { getPool, sql } = require("../libs/db");

const SETTINGS_ID = 1;

function getEnvDefaults() {
  return {
    shopName: String(process.env.SHOP_NAME || "PlantShop").trim(),
    shopPhone: String(process.env.SHOP_PHONE || "0900 000 000").trim(),
    shopAddress: String(process.env.SHOP_ADDRESS || "").trim(),
    defaultNote: null,
    logoUrl: null,
  };
}

function mapPrintSettingsRow(row) {
  return {
    shopName: row.shopName,
    shopPhone: row.shopPhone,
    shopAddress: row.shopAddress,
    defaultNote: row.defaultNote ?? null,
    logoUrl: row.logoUrl ?? null,
    updatedAt: row.updatedAt,
  };
}

function normalizePrintSettingsInput(body) {
  const shopName = String(body.shopName || "").trim();
  const shopPhone = String(body.shopPhone || "").trim();
  const shopAddress = String(body.shopAddress || "").trim();
  const defaultNote = String(body.defaultNote ?? "").trim().slice(0, 500) || null;
  const logoUrl = String(body.logoUrl ?? "").trim().slice(0, 1000) || null;

  if (!shopName || shopName.length > 255) {
    return { error: "Tên shop không hợp lệ." };
  }
  if (!shopPhone || shopPhone.length < 8 || shopPhone.length > 50) {
    return { error: "Số điện thoại shop không hợp lệ." };
  }
  if (!shopAddress || shopAddress.length > 500) {
    return { error: "Địa chỉ shop không hợp lệ." };
  }

  return {
    value: { shopName, shopPhone, shopAddress, defaultNote, logoUrl },
  };
}

async function fetchPrintSettingsRow(pool) {
  const result = await pool.request().query(
    `SELECT shop_name AS shopName,
            shop_phone AS shopPhone,
            shop_address AS shopAddress,
            default_note AS defaultNote,
            logo_url AS logoUrl,
            CONVERT(varchar, updated_at, 120) AS updatedAt
     FROM ShopPrintSettings
     WHERE id = ${SETTINGS_ID}`
  );
  return result.recordset[0] ?? null;
}

async function ensurePrintSettingsRow(pool) {
  const existing = await fetchPrintSettingsRow(pool);
  if (existing) return existing;

  const defaults = getEnvDefaults();
  if (!defaults.shopAddress) {
    defaults.shopAddress = "Cập nhật địa chỉ shop trong Cài đặt in ấn";
  }

  await pool
    .request()
    .input("shopName", sql.NVarChar, defaults.shopName)
    .input("shopPhone", sql.NVarChar, defaults.shopPhone)
    .input("shopAddress", sql.NVarChar, defaults.shopAddress)
    .input("defaultNote", sql.NVarChar, defaults.defaultNote)
    .input("logoUrl", sql.NVarChar, defaults.logoUrl)
    .query(
      `INSERT INTO ShopPrintSettings (id, shop_name, shop_phone, shop_address, default_note, logo_url)
       VALUES (${SETTINGS_ID}, @shopName, @shopPhone, @shopAddress, @defaultNote, @logoUrl)`
    );

  return fetchPrintSettingsRow(pool);
}

async function getPrintSettings(req, res, next) {
  try {
    const pool = await getPool();
    const row = await ensurePrintSettingsRow(pool);
    return res.json(mapPrintSettingsRow(row));
  } catch (err) {
    next(err);
  }
}

async function updatePrintSettings(req, res, next) {
  try {
    const parsed = normalizePrintSettingsInput(req.body);
    if (parsed.error) {
      return res.status(400).json({ message: parsed.error });
    }

    const pool = await getPool();
    await ensurePrintSettingsRow(pool);

    await pool
      .request()
      .input("shopName", sql.NVarChar, parsed.value.shopName)
      .input("shopPhone", sql.NVarChar, parsed.value.shopPhone)
      .input("shopAddress", sql.NVarChar, parsed.value.shopAddress)
      .input("defaultNote", sql.NVarChar, parsed.value.defaultNote)
      .input("logoUrl", sql.NVarChar, parsed.value.logoUrl)
      .query(
        `UPDATE ShopPrintSettings
         SET shop_name = @shopName,
             shop_phone = @shopPhone,
             shop_address = @shopAddress,
             default_note = @defaultNote,
             logo_url = @logoUrl,
             updated_at = GETDATE()
         WHERE id = ${SETTINGS_ID}`
      );

    const row = await fetchPrintSettingsRow(pool);
    return res.json({
      message: "Đã lưu cài đặt in ấn.",
      settings: mapPrintSettingsRow(row),
    });
  } catch (err) {
    next(err);
  }
}

async function resetPrintSettings(req, res, next) {
  try {
    const defaults = getEnvDefaults();
    if (!defaults.shopAddress) {
      defaults.shopAddress = "Cập nhật địa chỉ shop trong Cài đặt in ấn";
    }

    const pool = await getPool();
    await ensurePrintSettingsRow(pool);

    await pool
      .request()
      .input("shopName", sql.NVarChar, defaults.shopName)
      .input("shopPhone", sql.NVarChar, defaults.shopPhone)
      .input("shopAddress", sql.NVarChar, defaults.shopAddress)
      .input("defaultNote", sql.NVarChar, defaults.defaultNote)
      .input("logoUrl", sql.NVarChar, defaults.logoUrl)
      .query(
        `UPDATE ShopPrintSettings
         SET shop_name = @shopName,
             shop_phone = @shopPhone,
             shop_address = @shopAddress,
             default_note = NULL,
             logo_url = NULL,
             updated_at = GETDATE()
         WHERE id = ${SETTINGS_ID}`
      );

    const row = await fetchPrintSettingsRow(pool);
    return res.json({
      message: "Đã đặt lại cài đặt in ấn mặc định.",
      settings: mapPrintSettingsRow(row),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPrintSettings,
  updatePrintSettings,
  resetPrintSettings,
};