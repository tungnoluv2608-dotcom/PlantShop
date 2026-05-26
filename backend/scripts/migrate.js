require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { getPool, sql } = require("../src/libs/db");

const migrationsDir = path.resolve(__dirname, "../migrations");
const migrationsTableName = "SchemaMigrations";

function splitSqlBatches(sqlText) {
  return String(sqlText)
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

async function applyMigration(pool, filename) {
  const filePath = path.join(migrationsDir, filename);
  const fileContent = fs.readFileSync(filePath, "utf8");
  const batches = splitSqlBatches(fileContent);

  if (batches.length === 0) {
    console.log(`- Bo qua ${filename}: file rong`);
    return;
  }

  console.log(`- Dang chay ${filename}`);
  for (const batch of batches) {
    await pool.request().batch(batch);
  }

  await pool
    .request()
    .input("filename", sql.NVarChar, filename)
    .query(`INSERT INTO ${migrationsTableName} (filename) VALUES (@filename)`);

  console.log(`  Da ap dung ${filename}`);
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

  console.log("Migration status:");
  for (const filename of files) {
    console.log(`- [${applied.has(filename) ? "x" : " "}] ${filename}`);
  }
}

async function baselineMigrations(pool) {
  const files = getMigrationFiles();
  const applied = await getAppliedMigrations(pool);
  const pending = files.filter((filename) => !applied.has(filename));

  if (pending.length === 0) {
    console.log("Khong co migration nao can baseline.");
    return;
  }

  console.log(`Dang baseline ${pending.length} migration.`);
  for (const filename of pending) {
    await markMigrationAsApplied(pool, filename);
    console.log(`- Da danh dau ${filename}`);
  }
}

async function markNamedMigrations(pool, filenames) {
  const knownFiles = new Set(getMigrationFiles());
  for (const filename of filenames) {
    if (!knownFiles.has(filename)) {
      throw new Error(`Khong tim thay migration: ${filename}`);
    }
  }

  for (const filename of filenames) {
    await markMigrationAsApplied(pool, filename);
    console.log(`- Da danh dau ${filename}`);
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
      console.log("Khong co migration nao can chay.");
      return;
    }

    console.log(`Tim thay ${pending.length} migration chua ap dung.`);
    for (const filename of pending) {
      await applyMigration(pool, filename);
    }

    console.log("Hoan tat migration.");
  } catch (error) {
    console.error("Migration that bai:", error.message);
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
