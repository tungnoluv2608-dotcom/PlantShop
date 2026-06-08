const { sql } = require("../libs/db");

async function ensureWholesaleActivityTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1 FROM sys.tables WHERE name = 'WholesaleInquiryActivities'
    )
    BEGIN
      CREATE TABLE WholesaleInquiryActivities (
        id          INT IDENTITY(1,1) PRIMARY KEY,
        inquiry_id  INT            NOT NULL REFERENCES WholesaleInquiries(id) ON DELETE CASCADE,
        actor_id    INT            NULL REFERENCES Users(id),
        actor_name  NVARCHAR(255)  NOT NULL,
        action      NVARCHAR(100)  NOT NULL,
        details     NVARCHAR(MAX),
        created_at  DATETIME       NOT NULL DEFAULT GETDATE()
      );

      CREATE INDEX IX_WholesaleInquiryActivities_InquiryId
        ON WholesaleInquiryActivities(inquiry_id, created_at DESC);
    END
  `);
}

function mapActivity(row) {
  return {
    id: String(row.id),
    inquiryId: String(row.inquiryId),
    actorId: row.actorId != null ? String(row.actorId) : null,
    actorName: row.actorName,
    action: row.action,
    details: row.details || "",
    createdAt: row.createdAt,
  };
}

async function logWholesaleActivity(pool, {
  inquiryId,
  actorId = null,
  actorName,
  action,
  details = "",
}) {
  await ensureWholesaleActivityTable(pool);

  const result = await pool
    .request()
    .input("inquiryId", sql.Int, inquiryId)
    .input("actorId", sql.Int, actorId)
    .input("actorName", sql.NVarChar, actorName)
    .input("action", sql.NVarChar, action)
    .input("details", sql.NVarChar, details || null)
    .query(
      `INSERT INTO WholesaleInquiryActivities (inquiry_id, actor_id, actor_name, action, details)
       OUTPUT INSERTED.id
       VALUES (@inquiryId, @actorId, @actorName, @action, @details)`
    );

  return String(result.recordset[0].id);
}

async function listWholesaleActivities(pool, inquiryId) {
  await ensureWholesaleActivityTable(pool);

  const result = await pool
    .request()
    .input("inquiryId", sql.Int, inquiryId)
    .query(
      `SELECT id,
              inquiry_id AS inquiryId,
              actor_id AS actorId,
              actor_name AS actorName,
              action,
              details,
              CONVERT(varchar, created_at, 120) AS createdAt
       FROM WholesaleInquiryActivities
       WHERE inquiry_id = @inquiryId
       ORDER BY created_at DESC, id DESC`
    );

  return result.recordset.map(mapActivity);
}

module.exports = {
  ensureWholesaleActivityTable,
  logWholesaleActivity,
  listWholesaleActivities,
};