import { Pool } from "pg";
import "dotenv/config";

const pool: Pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST || "db",
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_DATABASE || "jwtauth",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    });

export default pool;
