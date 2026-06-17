const { getPool, sql } = require("../libs/db");
const { notifyNewWholesaleInquiry } = require("../services/wholesaleNotificationService");
const {
  sendWholesaleCustomerConfirmation,
  sendWholesaleAdminNotification,
} = require("../services/wholesaleEmailService");
const {
  logWholesaleActivity,
  listWholesaleActivities,
} = require("../services/wholesaleActivityService");
const {
  listWholesaleAdmins,
  pickAutoAssignAdmin,
  resolveAssignedAdmin,
} = require("../services/wholesaleAssignmentService");
const {
  parseJsonArray,
  createOrderFromWholesaleInquiry,
} = require("../services/wholesaleOrderService");

const WHOLESALE_STATUSES = new Set([
  "new",
  "contacted",
  "qualified",
  "quoted",
  "won",
  "lost",
  "archived",
]);

const WHOLESALE_SELECT_FIELDS = `
  w.id,
  w.company_name AS companyName,
  w.contact_name AS contactName,
  w.phone,
  w.email,
  w.estimated_quantity AS quantity,
  w.space_type AS type,
  w.project_location AS location,
  w.budget_range AS budget,
  w.timeline,
  w.note,
  w.interested_categories AS interestedCategoriesRaw,
  w.interested_products AS interestedProductsRaw,
  w.status,
  w.source,
  w.assigned_to AS assignedTo,
  w.assigned_admin_id AS assignedAdminId,
  w.admin_note AS adminNote,
  w.order_id AS orderId,
  CONVERT(varchar, w.created_at, 120) AS createdAt,
  CONVERT(varchar, w.updated_at, 120) AS updatedAt,
  CONVERT(varchar, w.contacted_at, 120) AS contactedAt,
  CONVERT(varchar, w.closed_at, 120) AS closedAt
`;

async function ensureWholesaleInquiriesTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.tables WHERE name = 'WholesaleInquiries'
    )
    BEGIN
      CREATE TABLE WholesaleInquiries (
        id                   INT IDENTITY(1,1) PRIMARY KEY,
        company_name         NVARCHAR(255)  NOT NULL,
        contact_name         NVARCHAR(255)  NOT NULL,
        phone                NVARCHAR(50)   NOT NULL,
        email                NVARCHAR(255)  NOT NULL,
        estimated_quantity   NVARCHAR(100)  NOT NULL,
        space_type           NVARCHAR(255),
        project_location     NVARCHAR(255),
        budget_range         NVARCHAR(255),
        timeline             NVARCHAR(255),
        note                 NVARCHAR(MAX),
        interested_categories NVARCHAR(MAX),
        interested_products  NVARCHAR(MAX),
        status               NVARCHAR(50)   NOT NULL DEFAULT 'new',
        source               NVARCHAR(100)  NOT NULL DEFAULT 'website_wholesale',
        assigned_to          NVARCHAR(255),
        assigned_admin_id    INT            NULL,
        admin_note           NVARCHAR(MAX),
        order_id             NVARCHAR(50)   NULL,
        created_at           DATETIME       NOT NULL DEFAULT GETDATE(),
        updated_at           DATETIME       NOT NULL DEFAULT GETDATE(),
        contacted_at         DATETIME       NULL,
        closed_at            DATETIME       NULL
      );

      CREATE INDEX IX_WholesaleInquiries_Status ON WholesaleInquiries(status);
      CREATE INDEX IX_WholesaleInquiries_CreatedAt ON WholesaleInquiries(created_at DESC);
    END

    IF COL_LENGTH('WholesaleInquiries', 'project_location') IS NULL
      ALTER TABLE WholesaleInquiries ADD project_location NVARCHAR(255);

    IF COL_LENGTH('WholesaleInquiries', 'budget_range') IS NULL
      ALTER TABLE WholesaleInquiries ADD budget_range NVARCHAR(255);

    IF COL_LENGTH('WholesaleInquiries', 'timeline') IS NULL
      ALTER TABLE WholesaleInquiries ADD timeline NVARCHAR(255);

    IF COL_LENGTH('WholesaleInquiries', 'interested_categories') IS NULL
      ALTER TABLE WholesaleInquiries ADD interested_categories NVARCHAR(MAX);

    IF COL_LENGTH('WholesaleInquiries', 'interested_products') IS NULL
      ALTER TABLE WholesaleInquiries ADD interested_products NVARCHAR(MAX);

    IF COL_LENGTH('WholesaleInquiries', 'order_id') IS NULL
      ALTER TABLE WholesaleInquiries ADD order_id NVARCHAR(50) NULL;

    IF COL_LENGTH('WholesaleInquiries', 'assigned_admin_id') IS NULL
      ALTER TABLE WholesaleInquiries ADD assigned_admin_id INT NULL;

    DECLARE @maxWholesaleId INT = (SELECT ISNULL(MAX(id), 0) FROM WholesaleInquiries);
    DBCC CHECKIDENT ('WholesaleInquiries', RESEED, @maxWholesaleId);
  `);
}

function parseInquiryId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 0) return null;
  return id;
}

function parseInterestItems(rawValue) {
  const parsed = parseJsonArray(rawValue);
  return parsed
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const id = String(item.id || "").trim();
      if (!id) return null;
      return {
        id,
        name: String(item.name || "").trim() || undefined,
        title: String(item.title || item.name || "").trim() || undefined,
      };
    })
    .filter(Boolean);
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
    interestedCategories: parseInterestItems(row.interestedCategoriesRaw),
    interestedProducts: parseInterestItems(row.interestedProductsRaw),
    status: row.status,
    source: row.source,
    assignedTo: row.assignedTo || "",
    assignedAdminId: row.assignedAdminId != null ? String(row.assignedAdminId) : "",
    adminNote: row.adminNote || "",
    orderId: row.orderId || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    contactedAt: row.contactedAt,
    closedAt: row.closedAt,
  };
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeInterestPayload(rawValue, label) {
  if (!Array.isArray(rawValue)) return { value: [] };

  const normalized = rawValue
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const id = normalizeWhitespace(item.id);
      if (!id || id.length > 50) return null;
      const name = normalizeWhitespace(item.name || item.title);
      if (name.length > 255) return null;
      return {
        id,
        ...(name ? { name, title: name } : {}),
      };
    })
    .filter(Boolean);

  if (normalized.length > 20) {
    return { error: `${label} vượt quá số lượng cho phép.` };
  }

  return { value: normalized };
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

  if (!company || !contact || !phone || !email || !quantity) {
    return {
      error: "Vui lòng nhập đầy đủ tên công ty, người liên hệ, số điện thoại, email và số lượng dự kiến.",
    };
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

  const categoriesParsed = normalizeInterestPayload(body.interestedCategories, "Danh mục quan tâm");
  if (categoriesParsed.error) return categoriesParsed;

  const productsParsed = normalizeInterestPayload(body.interestedProducts, "Sản phẩm quan tâm");
  if (productsParsed.error) return productsParsed;

  return {
    value: {
      company,
      contact,
      phone,
      email,
      quantity,
      type,
      location,
      budget,
      timeline,
      note,
      interestedCategories: categoriesParsed.value,
      interestedProducts: productsParsed.value,
    },
  };
}

function validateAdminUpdatePayload(body) {
  const status = normalizeWhitespace(body.status).toLowerCase();
  const assignedTo = normalizeWhitespace(body.assignedTo);
  const assignedAdminId = normalizeWhitespace(body.assignedAdminId);
  const adminNote = String(body.adminNote || "").trim();

  if (!status || !WHOLESALE_STATUSES.has(status)) {
    return { error: "Trạng thái yêu cầu không hợp lệ." };
  }

  if (assignedTo.length > 255) {
    return { error: "Người phụ trách quá dài." };
  }

  if (assignedAdminId && !/^\d+$/.test(assignedAdminId)) {
    return { error: "Mã admin phụ trách không hợp lệ." };
  }

  if (adminNote.length > 4000) {
    return { error: "Ghi chú nội bộ quá dài." };
  }

  return {
    value: { status, assignedTo, assignedAdminId: assignedAdminId || "", adminNote },
  };
}

function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, Number.parseInt(query.pageSize, 10) || 20));
  return { page, pageSize, offset: (page - 1) * pageSize };
}

function buildListConditions(query) {
  const status = normalizeWhitespace(query.status).toLowerCase();
  const keyword = normalizeWhitespace(query.q);
  const assigned = normalizeWhitespace(query.assigned).toLowerCase();
  const source = normalizeWhitespace(query.source);
  const dateFrom = normalizeWhitespace(query.dateFrom);
  const dateTo = normalizeWhitespace(query.dateTo);

  const conditions = [];
  const inputs = [];

  if (status && status !== "all") {
    conditions.push("w.status = @status");
    inputs.push(["status", sql.NVarChar, status]);
  }

  if (keyword) {
    conditions.push(`(
      w.company_name LIKE @keyword OR
      w.contact_name LIKE @keyword OR
      w.email LIKE @keyword OR
      w.phone LIKE @keyword OR
      ISNULL(w.note, '') LIKE @keyword OR
      ISNULL(w.project_location, '') LIKE @keyword
    )`);
    inputs.push(["keyword", sql.NVarChar, `%${keyword}%`]);
  }

  if (assigned === "unassigned") {
    conditions.push("(w.assigned_admin_id IS NULL AND ISNULL(w.assigned_to, '') = '')");
  } else if (assigned && assigned !== "all") {
    conditions.push("(w.assigned_to = @assigned OR CAST(w.assigned_admin_id AS NVARCHAR(20)) = @assigned)");
    inputs.push(["assigned", sql.NVarChar, assigned]);
  }

  if (source && source !== "all") {
    conditions.push("w.source = @source");
    inputs.push(["source", sql.NVarChar, source]);
  }

  if (dateFrom) {
    conditions.push("CAST(w.created_at AS DATE) >= @dateFrom");
    inputs.push(["dateFrom", sql.Date, dateFrom]);
  }

  if (dateTo) {
    conditions.push("CAST(w.created_at AS DATE) <= @dateTo");
    inputs.push(["dateTo", sql.Date, dateTo]);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    inputs,
  };
}

function applyInputs(request, inputs) {
  for (const [name, type, value] of inputs) {
    request.input(name, type, value);
  }
  return request;
}

async function fetchInquiryById(pool, id) {
  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query(
      `SELECT ${WHOLESALE_SELECT_FIELDS}
       FROM WholesaleInquiries w
       WHERE w.id = @id`
    );

  if (result.recordset.length === 0) return null;
  return mapWholesaleInquiry(result.recordset[0]);
}

async function createWholesaleInquiry(req, res, next) {
  try {
    const parsed = validatePublicInquiryPayload(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const autoAdmin = await pickAutoAssignAdmin(pool);

    const result = await pool
      .request()
      .input("company", sql.NVarChar, payload.company)
      .input("contact", sql.NVarChar, payload.contact)
      .input("phone", sql.NVarChar, payload.phone)
      .input("email", sql.NVarChar, payload.email)
      .input("quantity", sql.NVarChar, payload.quantity)
      .input("type", sql.NVarChar, payload.type || null)
      .input("location", sql.NVarChar, payload.location || null)
      .input("budget", sql.NVarChar, payload.budget || null)
      .input("timeline", sql.NVarChar, payload.timeline || null)
      .input("note", sql.NVarChar, payload.note || null)
      .input("interestedCategories", sql.NVarChar, JSON.stringify(payload.interestedCategories))
      .input("interestedProducts", sql.NVarChar, JSON.stringify(payload.interestedProducts))
      .input("assignedTo", sql.NVarChar, autoAdmin?.name || null)
      .input("assignedAdminId", sql.Int, autoAdmin?.id || null)
      .query(
        `INSERT INTO WholesaleInquiries (
           company_name, contact_name, phone, email, estimated_quantity,
           space_type, project_location, budget_range, timeline, note,
           interested_categories, interested_products, assigned_to, assigned_admin_id
         )
         OUTPUT INSERTED.id
         VALUES (
           @company, @contact, @phone, @email, @quantity,
           @type, @location, @budget, @timeline, @note,
           @interestedCategories, @interestedProducts, @assignedTo, @assignedAdminId
         )`
      );

    const inquiryId = Number(result.recordset[0].id);
    const createdInquiry = await fetchInquiryById(pool, inquiryId);

    await logWholesaleActivity(pool, {
      inquiryId,
      actorName: "Hệ thống",
      action: "created",
      details: "Khách gửi yêu cầu báo giá từ website.",
    });

    if (autoAdmin) {
      await logWholesaleActivity(pool, {
        inquiryId,
        actorId: autoAdmin.id,
        actorName: "Hệ thống",
        action: "assigned",
        details: `Tự động gán cho ${autoAdmin.name}.`,
      });
    }

    try {
      await notifyNewWholesaleInquiry(createdInquiry);
    } catch (notifyErr) {
      console.error("Wholesale notification failed:", notifyErr.message || notifyErr);
    }

    try {
      await sendWholesaleCustomerConfirmation(createdInquiry);
      await sendWholesaleAdminNotification(createdInquiry);
    } catch (emailErr) {
      console.error("Wholesale email failed:", emailErr.message || emailErr);
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
    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const { page, pageSize, offset } = parsePagination(req.query);
    const { whereClause, inputs } = buildListConditions(req.query);

    const countRequest = applyInputs(pool.request(), inputs);
    const countResult = await countRequest.query(
      `SELECT COUNT(*) AS total FROM WholesaleInquiries w ${whereClause}`
    );
    const total = Number(countResult.recordset[0]?.total || 0);

    const listRequest = applyInputs(pool.request(), inputs);
    listRequest.input("offset", sql.Int, offset);
    listRequest.input("pageSize", sql.Int, pageSize);

    const result = await listRequest.query(
      `SELECT ${WHOLESALE_SELECT_FIELDS}
       FROM WholesaleInquiries w
       ${whereClause}
       ORDER BY w.created_at DESC, w.id DESC
       OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`
    );

    const countsResult = await pool.request().query(
      `SELECT status, COUNT(*) AS count
       FROM WholesaleInquiries
       GROUP BY status`
    );
    const statusCounts = { all: 0 };
    for (const row of countsResult.recordset) {
      const key = String(row.status || "").toLowerCase();
      const count = Number(row.count || 0);
      statusCounts[key] = count;
      statusCounts.all += count;
    }

    return res.json({
      items: result.recordset.map(mapWholesaleInquiry),
      total,
      page,
      pageSize,
      statusCounts,
    });
  } catch (err) {
    next(err);
  }
}

async function getWholesaleInquiryById(req, res, next) {
  try {
    const id = parseInquiryId(req.params.id);
    if (id == null) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const inquiry = await fetchInquiryById(pool, id);
    if (!inquiry) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    return res.json(inquiry);
  } catch (err) {
    next(err);
  }
}

async function updateWholesaleInquiry(req, res, next) {
  try {
    const id = parseInquiryId(req.params.id);
    if (id == null) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const parsed = validateAdminUpdatePayload(req.body || {});
    if (parsed.error) return res.status(400).json({ message: parsed.error });
    const payload = parsed.value;

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const existingResult = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT ${WHOLESALE_SELECT_FIELDS}
         FROM WholesaleInquiries w
         WHERE w.id = @id`
      );

    if (existingResult.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    const previous = mapWholesaleInquiry(existingResult.recordset[0]);
    const previousStatus = String(previous.status || "").toLowerCase();
    const contactedAt = previousStatus === "new" && payload.status !== "new" ? new Date() : null;
    const closedAt = ["won", "lost", "archived"].includes(payload.status) ? new Date() : null;

    let assignedAdmin = null;
    if (payload.assignedAdminId) {
      assignedAdmin = await resolveAssignedAdmin(pool, payload.assignedAdminId);
      if (!assignedAdmin) {
        return res.status(400).json({ message: "Admin phụ trách không hợp lệ." });
      }
    }

    const assignedTo = assignedAdmin?.name || payload.assignedTo || null;
    const assignedAdminId = assignedAdmin?.id || null;

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("status", sql.NVarChar, payload.status)
      .input("assignedTo", sql.NVarChar, assignedTo)
      .input("assignedAdminId", sql.Int, assignedAdminId)
      .input("adminNote", sql.NVarChar, payload.adminNote || null)
      .input("contactedAt", sql.DateTime, contactedAt)
      .input("closedAt", sql.DateTime, closedAt)
      .query(
        `UPDATE WholesaleInquiries
         SET status = @status,
             assigned_to = @assignedTo,
             assigned_admin_id = @assignedAdminId,
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

    const actorName = req.user?.email || req.user?.name || "Admin";
    const actorId = req.user?.id || null;

    if (previous.status !== payload.status) {
      await logWholesaleActivity(pool, {
        inquiryId: id,
        actorId,
        actorName,
        action: "status_changed",
        details: `Đổi trạng thái: ${previous.status} → ${payload.status}`,
      });
    }

    if ((previous.assignedAdminId || "") !== (assignedAdminId ? String(assignedAdminId) : "")) {
      await logWholesaleActivity(pool, {
        inquiryId: id,
        actorId,
        actorName,
        action: "assigned",
        details: assignedTo ? `Gán cho ${assignedTo}.` : "Bỏ phân công.",
      });
    }

    if ((previous.adminNote || "") !== (payload.adminNote || "")) {
      await logWholesaleActivity(pool, {
        inquiryId: id,
        actorId,
        actorName,
        action: "note_updated",
        details: payload.adminNote ? "Cập nhật ghi chú nội bộ." : "Xóa ghi chú nội bộ.",
      });
    }

    const updated = await fetchInquiryById(pool, id);
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function getWholesaleInquiryActivities(req, res, next) {
  try {
    const id = parseInquiryId(req.params.id);
    if (id == null) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const exists = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT id FROM WholesaleInquiries WHERE id = @id");

    if (exists.recordset.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    const activities = await listWholesaleActivities(pool, id);
    return res.json(activities);
  } catch (err) {
    next(err);
  }
}

async function getWholesaleAdminOptions(req, res, next) {
  try {
    const pool = await getPool();
    const admins = await listWholesaleAdmins(pool);
    return res.json(admins);
  } catch (err) {
    next(err);
  }
}

async function createWholesaleOrder(req, res, next) {
  try {
    const id = parseInquiryId(req.params.id);
    if (id == null) {
      return res.status(400).json({ message: "Mã yêu cầu không hợp lệ." });
    }

    const pool = await getPool();
    await ensureWholesaleInquiriesTable(pool);

    const inquiry = await fetchInquiryById(pool, id);
    if (!inquiry) {
      return res.status(404).json({ message: "Không tìm thấy yêu cầu báo giá." });
    }

    if (!["won", "quoted", "qualified"].includes(inquiry.status)) {
      return res.status(400).json({
        message: "Chỉ có thể tạo đơn khi yêu cầu ở trạng thái Tiềm năng, Đã báo giá hoặc Thành công.",
      });
    }

    const orderResult = await createOrderFromWholesaleInquiry(pool, inquiry, {
      items: req.body?.items,
      paymentMethod: req.body?.paymentMethod || "cod",
      shippingMethod: req.body?.shippingMethod || "standard",
    });

    const actorName = req.user?.email || req.user?.name || "Admin";
    await logWholesaleActivity(pool, {
      inquiryId: id,
      actorId: req.user?.id || null,
      actorName,
      action: "order_created",
      details: `Tạo đơn hàng ${orderResult.orderId}.`,
    });

    if (inquiry.status !== "won") {
      await pool
        .request()
        .input("id", sql.Int, id)
        .input("status", sql.NVarChar, "won")
        .input("closedAt", sql.DateTime, new Date())
        .query(
          `UPDATE WholesaleInquiries
           SET status = @status,
               closed_at = CASE WHEN closed_at IS NULL THEN @closedAt ELSE closed_at END,
               updated_at = GETDATE()
           WHERE id = @id`
        );

      await logWholesaleActivity(pool, {
        inquiryId: id,
        actorId: req.user?.id || null,
        actorName,
        action: "status_changed",
        details: `Đổi trạng thái: ${inquiry.status} → won (sau khi tạo đơn).`,
      });
    }

    return res.status(201).json({
      orderId: orderResult.orderId,
      message: "Đã tạo đơn hàng từ yêu cầu B2B.",
      total: orderResult.total,
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    next(err);
  }
}

module.exports = {
  createWholesaleInquiry,
  listWholesaleInquiries,
  getWholesaleInquiryById,
  updateWholesaleInquiry,
  getWholesaleInquiryActivities,
  getWholesaleAdminOptions,
  createWholesaleOrder,
  ensureWholesaleInquiriesTable,
};