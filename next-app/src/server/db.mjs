import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const defaultDatabaseUrl = process.env.DATABASE_URL;

export const pool = new Pool({
  connectionString: defaultDatabaseUrl,
  ssl:
    process.env.DATABASE_SSL === "true"
      ? { rejectUnauthorized: process.env.DATABASE_SSL_STRICT === "true" }
      : undefined,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error", error);
});

export const migrationsDir = path.resolve(__dirname, "migrations");

export const withTransaction = async (fn) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};