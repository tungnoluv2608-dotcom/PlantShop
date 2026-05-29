const sql = require("mssql");
require("dotenv").config();

const config = {
  server: process.env.DB_SERVER || "localhost",
  database: process.env.DB_DATABASE || "PlantShopDB",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    encrypt: false,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool;

async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
    } catch (err) {
      const db = config.database;
      const server = config.server;
      if (err.code === "ELOGIN") {
        throw new Error(
          `[db] Login failed for "${config.user}" on ${server}. Check DB_USER and DB_PASSWORD in .env`
        );
      }
      if (err.originalError?.message?.includes("Could not open a connection") || err.code === "ESOCKET") {
        throw new Error(
          `[db] Cannot reach SQL Server at "${server}". Is the server running?`
        );
      }
      if (err.originalError?.message?.includes(db) || err.code === "EDBOPEN") {
        throw new Error(
          `[db] Database "${db}" not found on ${server}. Create it first:\n` +
          `     sqlcmd -S ${server} -Q "CREATE DATABASE [${db}]"\n` +
          `     Or run: npm run setup`
        );
      }
      throw new Error(`[db] Connection failed: ${err.message}`);
    }
  }
  return pool;
}

module.exports = { getPool, sql };
