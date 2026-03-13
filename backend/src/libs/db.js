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
    pool = await sql.connect(config);
    console.log("✅ Connected to SQL Server:", process.env.DB_DATABASE);
  }
  return pool;
}

module.exports = { getPool, sql };
