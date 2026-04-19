"use strict";

const { Pool } = require("pg");

const pool = new Pool({
  host:     process.env.DB_HOST     || "127.0.0.1",
  port:     Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_DATABASE || "jwtauth",
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD,
  ssl:      process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  max: 5,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  process.stderr.write(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    service: "dropshipping",
    message: "Unexpected DB pool error",
    meta: { error: err.message },
  }) + "\n");
});

module.exports = pool;
