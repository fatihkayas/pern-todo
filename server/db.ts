import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || "jwtauth",
  // Azure PostgreSQL Flexible Server requires SSL; local/test containers do not
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

export default pool;
