const { getPool, sql } = require("../libs/db");
const { notifyNewWholesaleInquiry } = require("../services/wholesaleNotificationService");

const WHOLESALE_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
  "archived",
]);

async function ensureWholesaleInquiriesTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = 'WholesaleInquiries'
    )
    BEGIN
      CREATE TABLE WholesaleInquiries (
        id                 INT IDENTITY(1,1) PRIMARY KEY,
        company_name       NVARCHAR(255)  NOT NULL,
        contact_name       NVARCHAR(255)  NOT NULL,
        phone              NVARCHAR(50)   NOT NULL,
        email              NVARCHAR(255)  NOT NULL,
        estimated_quantity NVARCHAR(100),
        space_type         NVARCHAR(255),
        project_location   NVARCHAR(255),
        budget_range       NVARCHAR(255),
        timeline           NVARCHAR(255),
        note               NVARCHAR(MAX),
        status             NVARCHAR(50)   NOT NULL DEFAULT 'new',
        source             NVARCHAR(100)  NOT NULL DEFAULT 'website_wholesale',
        assigned_to        NVARCHAR(255),
        admin_note         NVARCHAR(MAX),
        created_at         DATETIME       NOT NULL DEFAULT GETDATE(),
        updated_at         DATETIME       NOT NULL DEFAULT GETDATE(),
        contacted_at       DATETIME       NULL,
        closed_at          DATETIME       NULL
      );

      CREATE INDEX IX_WholesaleInquiries_Status
        ON WholesaleInquiries(status);

      CREATE INDEX IX_WholesaleInquiries_CreatedAt
        ON WholesaleInquiries(created_at DESC);
    END

    IF COL_LENGTH('WholesaleInquiries', 'project_location') IS NULL
    BEGIN
      ALTER TABLE WholesaleInquiries ADD project_location NVARCHAR(255);
    END

    IF COL_LENGTH('WholesaleInquiries', 'budget_range') IS NULL
    BEGIN
      ALTER TABLE WholesaleInquiries ADD budget_range NVARCHAR(255);
    END

    IF COL_LENGTH('WholesaleInquiries', 'timeline') IS NULL
    BEGIN
      ALTER TABLE WholesaleInquiries ADD timeline NVARCHAR(255);
    END
  `);
}

function mapWholesaleInquiry(row) {
  return {
    id: String(row.id),
    company: row.companyName,
    contact: row.contactName,
    phone: row.phone,
    email: row.email,
    quantity: row.quantity || "",
    type: row.type || "",
    location: row.location || "",
    budget: row.budget || "",
    timeline: row.timeline || "",
    note: row.note || "",
    status: row.status,
    source: row.source,
    assignedTo: row.assignedTo || "",
    adminNote: row.adminNote || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contactedAt: row.contactedAt,
    closedAt: row.closedAt,
  };
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function validatePublicInquiryPayload(body) {
  const company = normalizeWhitespace(body.company);
  const contact = normalizeWhitespace(body.contact);
  const phone = normalizeWhitespace(body.phone);
  const email = normalizeWhitespace(body.email).toLowerCase();
  const quantity = normalizeWhitespace(body.quantity);
  const type = normalizeWhitespace(body.type);
  const location = normalizeWhitespace(body.location);
  const budget = normalizeWhitespace(body.budget);
  const timeline = normalizeWhitespace(body.timeline);
  const note = String(body.note || "").trim();

  if (!company || !contact || !phone || !email) {
    return { error: "Vui lòng nhập đầy đủ tên công ty, người liên hệ, số điện thoại và email." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email không hợp lệ." };
  }

  if (!/^[0-9+().\-\s]{8,20}$/.test(phone)) {
    return { error: "Số điện thoại không hợp lệ." };
  }

  if (
    company.length > 255 ||
    contact.length > 255 ||
    email.length > 255 ||
    type.length > 255 ||
    location.length > 255 ||
    budget.length > 255 ||
    timeline.length > 255
  ) {
    return { error: "Một số trường vượt quá độ dài cho phép." };
  }

  if (quantity.length > 100) {
    return { error: "Số lượng dự kiến quá dài." };
  }

  if (note.length > 4000) {
    return { error: "Nội dung yêu cầu quá dài." };
  }

  return {
    value: { company, contact, phone, email, quantity, type, location, budget, timeline, note },
  };
}

function validateAdminUpdatePayload(body) {
  const status = normalizeWhitespace(body.status).toLowerCase();
  const assignedTo = normalizeWhitespace(body.assignedTo);
  const adminNote = String(body.adminNote || "").trim();

  if (!status || !WHOLESALE_STATUSES.has(status)) {
    return { error: "Trạng thái yêu cầu không hợp lệ." };
  }

  if (assignedTo.length > 255) {
    return { error: "Người phụ trách quá dài." };
  }

  if (adminNote.length > 4000) {
    return { error: "Ghi chú nội bộ quá dài." };
  }

  return {
    value: { status, assignedTo, adminNote },
  };
}

async function createWholesaleInquiry(req, res, next) {
  try {
    const parsed = validatePublicInquiryPayload(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const result = await pool.request()
      .input("company", sql.NVarChar, payload.company)
      .input("contact", sql.NVarChar, payload.contact)
      .input("phone", sql.NVarChar, payload.phone)
      .input("email", sql.NVarChar, payload.email)
      .input("quantity", sql.NVarChar, payload.quantity || null)
      .input("type", sql.NVarChar, payload.type || null)
      .input("location", sql.NVarChar, payload.location || null)
      .input("budget", sql.NVarChar, payload.budget || null)
      .input("timeline", sql.NVarChar, payload.timeline || null)
      .input("note", sql.NVarChar, payload.note || null)
      .query(
        `INSERT INTO WholesaleInquiries (company_name, contact_name, phone, email, estimated_quantity, space_type, project_location, budget_range, timeline, note)
         OUTPUT INSERTED.id
         VALUES (@company, @contact, @phone, @email, @quantity, @type, @location, @budget, @timeline, @note)`
      );

    const createdInquiry = {
      id: String(result.recordset[0].id),
      company: payload.company,
      contact: payload.contact,
      phone: payload.phone,
      email: payload.email,
      quantity: payload.quantity,
      type: payload.type,
      location: payload.location,
      budget: payload.budget,
      timeline: payload.timeline,
      note: payload.note,
    };

    try {
      await notifyNewWholesaleInquiry(createdInquiry);
    } catch (notifyErr) {
      console.error("Wholesale notification failed:", notifyErr.message || notifyErr);
    }

    return res.status(201).json({
      id: createdInquiry.id,
      message: "Đã ghi nhận yêu cầu báo giá. Chúng tôi sẽ liên hệ sớm.",
    });
  } catch (err) {
    next(err);
  }
}

async function listWholesaleInquiries(req, res, next) {
  try {
    const status = normalizeWhitespace(req.query.status).toLowerCase();
    const keyword = normalizeWhitespace(req.query.q);

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const request = pool.request();
    const conditions = [];

    if (status && status !== "all") {
      request.input("status", sql.NVarChar, status);
      conditions.push("status = @status");
    }

    if (keyword) {
      request.input("keyword", sql.NVarChar, `%${keyword}%`);
      conditions.push(`(
        company_name LIKE @keyword OR
        contact_name LIKE @keyword OR
        email LIKE @keyword OR
        phone LIKE @keyword OR
        ISNULL(note, '') LIKE @keyword
      )`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await request.query(
      `SELECT id,
              company_name AS companyName,
              contact_name AS contactName,
              phone,
              email,
              estimated_quantity AS quantity,
              space_type AS type,
              project_location AS location,
              budget_range AS budget,
              timeline,
              note,
              status,
              source,
              assigned_to AS assignedTo,
              admin_note AS adminNote,
              CONVERT(varchar, created_at, 120) AS createdAt,
              CONVERT(varchar, updated_at, 120) AS updatedAt,
              CONVERT(varchar, contacted_at, 120) AS contactedAt,
              CONVERT(varchar, closed_at, 120) AS closedAt
       FROM WholesaleInquiries
       ${whereClause}
       ORDER BY created_at DESC, id DESC`
    );

    return res.json(result.recordset.map(mapWholesaleInquiry));
  } catch (err) {
    next(err);
  }
}

async function getWholesaleInquiryById(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(
        `SELECT id,
                company_name AS companyName,
                contact_name AS contactName,
                phone,
                email,
                estimated_quantity AS quantity,
                space_type AS type,
                project_location AS location,
                budget_range AS budget,
                timeline,
                note,
                status,
                source,
                assigned_to AS assignedTo,
                admin_note AS adminNote,
                CONVERT(varchar, created_at, 120) AS createdAt,
                CONVERT(varchar, updated_at, 120) AS updatedAt,
                CONVERT(varchar, contacted_at, 120) AS contactedAt,
                CONVERT(varchar, closed_at, 120) AS closedAt
         FROM WholesaleInquiries
         WHERE id = @id`
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    return res.json(mapWholesaleInquiry(result.recordset[0]));
  } catch (err) {
    next(err);
  }
}

async function updateWholesaleInquiry(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const parsed = validateAdminUpdatePayload(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const existing = await pool.request()
      .input("id", sql.Int, id)
      .query("SELECT id, status FROM WholesaleInquiries WHERE id = @id");

    if (existing.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    const previousStatus = String(existing.recordset[0].status || "").toLowerCase();
    const contactedAt = previousStatus === "new" && payload.status !== "new" ? new Date() : null;
    const closedAt = ["won", "lost", "archived"].includes(payload.status) ? new Date() : null;

    await pool.request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, payload.status)
      .input("assignedTo", sql.NVarChar, payload.assignedTo || null)
      .input("adminNote", sql.NVarChar, payload.adminNote || null)
      .input("contactedAt", sql.DateTime, contactedAt)
      .input("closedAt", sql.DateTime, closedAt)
      .query(
        `UPDATE WholesaleInquiries
         SET status = @status,
             assigned_to = @assignedTo,
             admin_note = @adminNote,
             updated_at = GETDATE(),
             contacted_at = CASE
               WHEN contacted_at IS NULL AND @contactedAt IS NOT NULL THEN @contactedAt
               ELSE contacted_at
             END,
             closed_at = CASE
               WHEN @closedAt IS NOT NULL THEN @closedAt
               WHEN @status NOT IN ('won', 'lost', 'archived') THEN NULL
               ELSE closed_at
             END
         WHERE id = @id`
      );

    const updated = await pool.request()
      .input("id", sql.Int, id)
      .query(
        `SELECT id,
                company_name AS companyName,
                contact_name AS contactName,
                phone,
                email,
                estimated_quantity AS quantity,
                space_type AS type,
                project_location AS location,
                budget_range AS budget,
                timeline,
                note,
                status,
                source,
                assigned_to AS assignedTo,
                admin_note AS adminNote,
                CONVERT(varchar, created_at, 120) AS createdAt,
                CONVERT(varchar, updated_at, 120) AS updatedAt,
                CONVERT(varchar, contacted_at, 120) AS contactedAt,
                CONVERT(varchar, closed_at, 120) AS closedAt
         FROM WholesaleInquiries
         WHERE id = @id`
      );

    return res.json(mapWholesaleInquiry(updated.recordset[0]));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createWholesaleInquiry,
  listWholesaleInquiries,
  getWholesaleInquiryById,
  updateWholesaleInquiry,
  ensureWholesaleInquiriesTable,
};
