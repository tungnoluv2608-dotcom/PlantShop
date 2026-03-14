const { getPool, sql } = require("../libs/db");

async function ensureUserAddressesTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = 'UserAddresses'
    )
    BEGIN
      CREATE TABLE UserAddresses (
        id           INT IDENTITY(1,1) PRIMARY KEY,
        user_id      INT            NOT NULL REFERENCES Users(id),
        label        NVARCHAR(100)  NOT NULL,
        full_name    NVARCHAR(255)  NOT NULL,
        phone        NVARCHAR(50)   NOT NULL,
        province     NVARCHAR(255)  NOT NULL,
        district     NVARCHAR(255)  NOT NULL,
        ward         NVARCHAR(255),
        address_line NVARCHAR(MAX)  NOT NULL,
        is_default   BIT            NOT NULL DEFAULT 0,
        created_at   DATETIME       NOT NULL DEFAULT GETDATE(),
        updated_at   DATETIME       NOT NULL DEFAULT GETDATE()
      );

      CREATE INDEX IX_UserAddresses_UserId ON UserAddresses(user_id);
    END
  `);
}

function mapAddressRow(row) {
  return {
    id: String(row.id),
    label: row.label,
    fullName: row.fullName,
    phone: row.phone,
    province: row.province,
    district: row.district,
    ward: row.ward || "",
    address: row.address,
    isDefault: !!row.isDefault,
  };
}

function validateAddressPayload(body) {
  const label = String(body.label || "").trim();
  const fullName = String(body.fullName || "").trim();
  const phone = String(body.phone || "").trim();
  const province = String(body.province || "").trim();
  const district = String(body.district || "").trim();
  const ward = String(body.ward || "").trim();
  const address = String(body.address || "").trim();
  const isDefault = !!body.isDefault;

  if (!label || !fullName || !phone || !province || !district || !address) {
    return { error: "Thiếu thông tin địa chỉ bắt buộc." };
  }

  return {
    value: { label, fullName, phone, province, district, ward, address, isDefault },
  };
}

// GET /api/addresses
async function listMyAddresses(req, res, next) {
  try {
    const pool = await getPool();
    await ensureUserAddressesTable(pool);
    const result = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT id, label,
                full_name AS fullName,
                phone,
                province,
                district,
                ward,
                address_line AS address,
                is_default AS isDefault
         FROM UserAddresses
         WHERE user_id = @userId
         ORDER BY is_default DESC, updated_at DESC, created_at DESC`
      );

    return res.json(result.recordset.map(mapAddressRow));
  } catch (err) {
    next(err);
  }
}

// POST /api/addresses
async function createAddress(req, res, next) {
  try {
    const parsed = validateAddressPayload(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureUserAddressesTable(pool);

    if (payload.isDefault) {
      await pool
        .request()
        .input("userId", sql.Int, req.user.id)
        .query("UPDATE UserAddresses SET is_default = 0 WHERE user_id = @userId");
    }

    const insertResult = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .input("label", sql.NVarChar, payload.label)
      .input("fullName", sql.NVarChar, payload.fullName)
      .input("phone", sql.NVarChar, payload.phone)
      .input("province", sql.NVarChar, payload.province)
      .input("district", sql.NVarChar, payload.district)
      .input("ward", sql.NVarChar, payload.ward)
      .input("address", sql.NVarChar, payload.address)
      .input("isDefault", sql.Bit, payload.isDefault)
      .query(
        `INSERT INTO UserAddresses (user_id, label, full_name, phone, province, district, ward, address_line, is_default)
         OUTPUT INSERTED.id
         VALUES (@userId, @label, @fullName, @phone, @province, @district, @ward, @address, @isDefault)`
      );

    const id = insertResult.recordset[0].id;

    // Auto-set first address as default if user has no default yet.
    const hasDefaultResult = await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query("SELECT TOP 1 id FROM UserAddresses WHERE user_id = @userId AND is_default = 1");

    if (hasDefaultResult.recordset.length === 0) {
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("userId", sql.Int, req.user.id)
        .query("UPDATE UserAddresses SET is_default = 1 WHERE id = @id AND user_id = @userId");
    }

    const created = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT id, label,
                full_name AS fullName,
                phone,
                province,
                district,
                ward,
                address_line AS address,
                is_default AS isDefault
         FROM UserAddresses
         WHERE id = @id AND user_id = @userId`
      );

    return res.status(201).json(mapAddressRow(created.recordset[0]));
  } catch (err) {
    next(err);
  }
}

// PUT /api/addresses/:id
async function updateAddress(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id địa chỉ không hợp lệ." });
    }

    const parsed = validateAddressPayload(req.body);
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureUserAddressesTable(pool);

    const existing = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT id FROM UserAddresses WHERE id = @id AND user_id = @userId");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
    }

    if (payload.isDefault) {
      await pool
        .request()
        .input("userId", sql.Int, req.user.id)
        .query("UPDATE UserAddresses SET is_default = 0 WHERE user_id = @userId");
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .input("label", sql.NVarChar, payload.label)
      .input("fullName", sql.NVarChar, payload.fullName)
      .input("phone", sql.NVarChar, payload.phone)
      .input("province", sql.NVarChar, payload.province)
      .input("district", sql.NVarChar, payload.district)
      .input("ward", sql.NVarChar, payload.ward)
      .input("address", sql.NVarChar, payload.address)
      .input("isDefault", sql.Bit, payload.isDefault)
      .query(
        `UPDATE UserAddresses
         SET label = @label,
             full_name = @fullName,
             phone = @phone,
             province = @province,
             district = @district,
             ward = @ward,
             address_line = @address,
             is_default = @isDefault,
             updated_at = GETDATE()
         WHERE id = @id AND user_id = @userId`
      );

    const updated = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query(
        `SELECT id, label,
                full_name AS fullName,
                phone,
                province,
                district,
                ward,
                address_line AS address,
                is_default AS isDefault
         FROM UserAddresses
         WHERE id = @id AND user_id = @userId`
      );

    return res.json(mapAddressRow(updated.recordset[0]));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id địa chỉ không hợp lệ." });
    }

    const pool = await getPool();
    await ensureUserAddressesTable(pool);

    const existing = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT id, is_default AS isDefault FROM UserAddresses WHERE id = @id AND user_id = @userId");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
    }

    const wasDefault = !!existing.recordset[0].isDefault;

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("DELETE FROM UserAddresses WHERE id = @id AND user_id = @userId");

    if (wasDefault) {
      const nextDefault = await pool
        .request()
        .input("userId", sql.Int, req.user.id)
        .query("SELECT TOP 1 id FROM UserAddresses WHERE user_id = @userId ORDER BY updated_at DESC, created_at DESC");

      if (nextDefault.recordset.length > 0) {
        await pool
          .request()
          .input("id", sql.Int, nextDefault.recordset[0].id)
          .input("userId", sql.Int, req.user.id)
          .query("UPDATE UserAddresses SET is_default = 1 WHERE id = @id AND user_id = @userId");
      }
    }

    return res.json({ message: "Đã xóa địa chỉ." });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/addresses/:id/default
async function setDefaultAddress(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "id địa chỉ không hợp lệ." });
    }

    const pool = await getPool();
    await ensureUserAddressesTable(pool);

    const existing = await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("SELECT id FROM UserAddresses WHERE id = @id AND user_id = @userId");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy địa chỉ." });
    }

    await pool
      .request()
      .input("userId", sql.Int, req.user.id)
      .query("UPDATE UserAddresses SET is_default = 0 WHERE user_id = @userId");

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("userId", sql.Int, req.user.id)
      .query("UPDATE UserAddresses SET is_default = 1, updated_at = GETDATE() WHERE id = @id AND user_id = @userId");

    return res.json({ message: "Đã đặt mặc định." });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
