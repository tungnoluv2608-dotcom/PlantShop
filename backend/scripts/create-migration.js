const fs = require("fs");
const path = require("path");

const migrationsDir = path.resolve(__dirname, "../migrations");

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTimestamp(date) {
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildTemplate(name) {
  return [
    `-- Migration: ${name}`,
    "",
    "BEGIN TRANSACTION;",
    "",
    "-- Write SQL here",
    "",
    "COMMIT TRANSACTION;",
    "GO",
    "",
  ].join("\n");
}

function main() {
  const rawName = process.argv.slice(2).join(" ").trim();
  if (!rawName) {
    console.error("Please provide a migration name. Example: npm run migrate:new -- add_order_notes");
    process.exit(1);
  }

  const slug = slugify(rawName);
  if (!slug) {
    console.error("Invalid migration name.");
    process.exit(1);
  }

  const filename = `${formatTimestamp(new Date())}_${slug}.sql`;
  const filePath = path.join(migrationsDir, filename);

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }

  fs.writeFileSync(filePath, buildTemplate(rawName), "utf8");
  console.log(`Created migration: ${filename}`);
}

main();
