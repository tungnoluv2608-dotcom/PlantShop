require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { getPool, sql } = require("../src/libs/db");

const migrationsDir = path.resolve(__dirname, "../migrations");
const schemaFilePath = path.resolve(__dirname, "../schema.sql");
const migrationsTableName = "SchemaMigrations";
const bootstrapProbeTables = [
  "Users",
  "Categories",
  "Products",
  "Planters",
  "Orders",
  "Reviews",
  "BlogPosts",
  "UserAddresses",
  "UserWishlistItems",
  "WholesaleInquiries",
  "UserPlantAdvisorHistory",
];

function normalizeSql(sqlText) {
  return String(sqlText).replace(/^\s*USE\s+\[[^\]]+\]\s*;\s*$/gim, "").replace(/^\s*USE\s+\S+\s*;\s*$/gim, "");
}

function splitSqlBatches(sqlText) {
  return normalizeSql(sqlText)
    .split(/^\s*GO\s*(?:--.*)?$/gim)
    .map((batch) => batch.trim())
    .filter(Boolean);
}

async function ensureMigrationsTable(pool) {
  await pool.request().query(`
    IF NOT EXISTS (
      SELECT 1
      FROM sys.tables
      WHERE name = '${migrationsTableName}'
    )
    BEGIN
      CREATE TABLE ${migrationsTableName} (
        id INT IDENTITY(1,1) PRIMARY KEY,
        filename NVARCHAR(255) NOT NULL UNIQUE,
        applied_at DATETIME NOT NULL DEFAULT GETDATE()
      );
    END
  `);
}

async function getAppliedMigrations(pool) {
  const result = await pool.request().query(`
    SELECT filename
    FROM ${migrationsTableName}
    ORDER BY filename
  `);

  return new Set(result.recordset.map((row) => row.filename));
}

function getMigrationFiles() {
  return fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".sql"))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function getNamedMigrationsFromArgs() {
  const names = [];
  for (let i = 0; i < process.argv.length; i += 1) {
    if (process.argv[i] === "--mark-applied") {
      names.push(...process.argv.slice(i + 1).filter((arg) => !arg.startsWith("--")));
      break;
    }
  }
  return names;
}

async function getExistingAppTables(pool) {
  const tableNames = [...bootstrapProbeTables];
  const request = pool.request();

  tableNames.forEach((tableName, index) => {
    request.input(`tableName${index}`, sql.NVarChar, tableName);
  });

  const placeholders = tableNames.map((_, index) => `@tableName${index}`).join(", ");
  const result = await request.query(`
    SELECT name
    FROM sys.tables
    WHERE name IN (${placeholders})
  `);

  return new Set(result.recordset.map((row) => row.name));
}

async function executeSqlFile(pool, filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const batches = splitSqlBatches(fileContent);

  if (batches.length === 0) {
    throw new Error(`Empty SQL file: ${path.basename(filePath)}`);
  }

  for (const batch of batches) {
    await pool.request().batch(batch);
  }
}

async function bootstrapSchemaIfNeeded(pool) {
  const existingTables = await getExistingAppTables(pool);

  if (existingTables.size === 0) {
    console.log("[migrate] Initializing schema from schema.sql...");
    await executeSqlFile(pool, schemaFilePath);
    await ensureMigrationsTable(pool);
    await baselineMigrations(pool);
    return;
  }

  if (!existingTables.has("Users")) {
    const foundTables = [...existingTables].sort().join(", ");
    throw new Error(
      `Database is in an inconsistent state. Found tables: ${foundTables}. ` +
        "Run schema.sql or complete bootstrap manually before migrating."
    );
  }
}

async function applyMigration(pool, filename) {
  const filePath = path.join(migrationsDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const batches = splitSqlBatches(fileContent);

  if (batches.length === 0) {
    return;
  }

  for (const batch of batches) {
    await pool.request().batch(batch);
  }

  await pool
    .request()
    .input("filename", sql.NVarChar, filename)
    .query(`INSERT INTO ${migrationsTableName} (filename) VALUES (@filename)`);

  console.log(`  + ${filename}`);
}

async function markMigrationAsApplied(pool, filename) {
  await pool
    .request()
    .input("filename", sql.NVarChar, filename)
    .query(`
      IF NOT EXISTS (
        SELECT 1
        FROM ${migrationsTableName}
        WHERE filename = @filename
      )
      BEGIN
        INSERT INTO ${migrationsTableName} (filename)
        VALUES (@filename);
      END
    `);
}

async function printStatus(pool) {
  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);

  console.log("[migrate] Status:");
  for (const filename of files) {
    console.log(`  [${applied.has(filename) ? "x" : " "}] ${filename}`);
  }
}

async function baselineMigrations(pool) {
  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);
  const pending = files.filter((filename) => !applied.has(filename));

  if (pending.length === 0) {
    return;
  }

  for (const filename of pending) {
    await markMigrationAsApplied(pool, filename);
  }
  console.log(`[migrate] Baselined ${pending.length} migrations`);
}

async function markNamedMigrations(pool, filenames) {
  const knownFiles = new Set(getMigrationFiles());
  for (const filename of filenames) {
    if (!knownFiles.has(filename)) {
      throw new Error(`Migration not found: ${filename}`);
    }
  }

  for (const filename of filenames) {
    await markMigrationAsApplied(pool, filename);
    console.log(`  + ${filename} (marked)`);
  }
}

async function run() {
  const namedMigrations = getNamedMigrationsFromArgs();
  const mode = process.argv.includes("--status")
    ? "status"
    : namedMigrations.length > 0
      ? "mark-applied"
      : process.argv.includes("--baseline")
        ? "baseline"
        : "migrate";
  let pool;

  try {
    pool = await getPool();
    await bootstrapSchemaIfNeeded(pool);
    await ensureMigrationsTable(pool);

    if (mode === "status") {
      await printStatus(pool);
      return;
    }

    if (mode === "baseline") {
      await baselineMigrations(pool);
      return;
    }

    if (mode === "mark-applied") {
      await markNamedMigrations(pool, namedMigrations);
      return;
    }

    const files = getMigrationFiles();
    const applied = await getAppliedMigrations(pool);
    const pending = files.filter((filename) => !applied.has(filename));

    if (pending.length === 0) {
      return;
    }

    console.log(`[migrate] Applying ${pending.length} pending:`);
    for (const filename of pending) {
      await applyMigration(pool, filename);
    }
  } catch (error) {
    console.error("[migrate] Failed:", error.message);
    process.exitCode = 1;
  } finally {
    await sql.close();
  }
}

if (require.main === module) {
  run();
}

module.exports = {
  run,
};
