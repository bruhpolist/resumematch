import fs from "node:fs/promises";
import path from "node:path";
import { migrationsDir, pool } from "./db.mjs";

const ensureMigrationsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

const run = async () => {
  await ensureMigrationsTable();

  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort((a, b) => a.localeCompare(b));

  for (const file of files) {
    const migrationId = path.basename(file);
    const existing = await pool.query(
      "SELECT id FROM schema_migrations WHERE id = $1",
      [migrationId]
    );

    if (existing.rowCount > 0) {
      continue;
    }

    const migrationSql = await fs.readFile(path.join(migrationsDir, file), "utf-8");
    console.log(`Running migration: ${migrationId}`);
    await pool.query(migrationSql);
    await pool.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migrationId]);
    console.log(`Migration complete: ${migrationId}`);
  }

  console.log("Migrations are up to date.");
};

run()
  .catch((error) => {
    console.error("Migration failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });