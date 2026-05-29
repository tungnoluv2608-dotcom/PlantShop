require("dotenv").config();

const path = require("path");
const { spawnSync } = require("child_process");

function runMigrations() {
  if (process.env.SKIP_MIGRATIONS === "true") {
    console.log("[migrate] Skipped (SKIP_MIGRATIONS=true)");
    return;
  }

  const migrationScriptPath = path.resolve(__dirname, "migrate.js");
  const result = spawnSync(process.execPath, [migrationScriptPath], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function startServer() {
  require("../src/server");
}

runMigrations();
startServer();
