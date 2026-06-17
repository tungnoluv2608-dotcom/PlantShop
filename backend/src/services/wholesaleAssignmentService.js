const { sql } = require("../libs/db");

const OPEN_STATUSES = ["new", "contacted", "qualified", "quoted"];

async function listWholesaleAdmins(pool) {
  const result = await pool.request().query(
    `SELECT id, name, email
     FROM Users
     WHERE role = 'admin'
     ORDER BY name ASC, id ASC`
  );

  return result.recordset.map((row) => ({
    id: String(row.id),
    name: row.name,
    email: row.email,
  }));
}

async function pickAutoAssignAdmin(pool) {
  const admins = await listWholesaleAdmins(pool);
  if (admins.length === 0) return null;

  const openStatusList = OPEN_STATUSES.map((status) => `'${status}'`).join(", ");
  const result = await pool.request().query(
    `SELECT u.id, u.name, u.email,
            COUNT(w.id) AS openCount
     FROM Users u
     LEFT JOIN WholesaleInquiries w
       ON w.assigned_admin_id = u.id
      AND w.status IN (${openStatusList})
     WHERE u.role = 'admin'
     GROUP BY u.id, u.name, u.email
     ORDER BY openCount ASC, u.id ASC`
  );

  if (result.recordset.length === 0) {
    const fallback = admins[0];
    return { id: Number(fallback.id), name: fallback.name, email: fallback.email };
  }

  const row = result.recordset[0];
  return { id: Number(row.id), name: row.name, email: row.email };
}

async function resolveAssignedAdmin(pool, assignedAdminId) {
  const id = Number(assignedAdminId);
  if (!Number.isInteger(id) || id < 0) return null;

  const result = await pool
    .request()
    .input("id", sql.Int, id)
    .query("SELECT id, name, email FROM Users WHERE id = @id AND role = 'admin'");

  if (result.recordset.length === 0) return null;
  const row = result.recordset[0];
  return { id: Number(row.id), name: row.name, email: row.email };
}

module.exports = {
  listWholesaleAdmins,
  pickAutoAssignAdmin,
  resolveAssignedAdmin,
};