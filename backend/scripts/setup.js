require("dotenv").config();

const sql = require("mssql");
const { spawnSync } = require("child_process");
const path = require("path");

const masterConfig = {
  server: process.env.DB_SERVER || "localhost",
  database: "master",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    encrypt: false,
    enableArithAbort: true,
  },
};

const dbName = process.env.DB_DATABASE || "PlantShopDB";

async function ensureDatabase() {
  let pool;
  try {
    pool = await sql.connect(masterConfig);
    const result = await pool.request().query(
      `SELECT DB_ID('${dbName}') AS dbId`
    );

    if (result.recordset[0].dbId == null) {
      console.log(`[setup] Creating database "${dbName}"...`);
      await pool.request().batch(`CREATE DATABASE [${dbName}]`);
      console.log(`[setup] Database "${dbName}" created`);
    } else {
      console.log(`[setup] Database "${dbName}" already exists`);
    }
  } catch (err) {
    if (err.code === "ELOGIN") {
      console.error(`[setup] Login failed. Check DB_USER and DB_PASSWORD in .env`);
    } else if (err.code === "ESOCKET") {
      console.error(`[setup] Cannot reach SQL Server at "${masterConfig.server}". Is it running?`);
    } else {
      console.error(`[setup] Failed to connect:`, err.message);
    }
    process.exit(1);
  } finally {
    await sql.close();
  }
}

function runScript(scriptName) {
  const scriptPath = path.resolve(__dirname, scriptName);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

async function main() {
  console.log("[setup] PlantWeb database setup\n");

  await ensureDatabase();
  console.log("");

  console.log("[setup] Running migrations...");
  runScript("migrate.js");
  console.log("");

  const skipSeed = process.argv.includes("--no-seed");
  if (!skipSeed) {
    console.log("[setup] Seeding data...");
    runScript("../seed.js");
  }

  console.log("\n[setup] Done. Run `npm run dev` to start the server.");
}

main();
