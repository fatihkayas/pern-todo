"use strict";

/**
 * Run once to create the required tables.
 * Usage: node migrate.js
 */

const db = require("./db");

async function migrate() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS dropship_products (
      id          SERIAL PRIMARY KEY,
      sku         VARCHAR(100) NOT NULL UNIQUE,
      name        VARCHAR(500) NOT NULL,
      description TEXT,
      price       NUMERIC(10, 2) NOT NULL,
      stock       INTEGER NOT NULL DEFAULT 0,
      category    VARCHAR(200),
      image_url   TEXT,
      weight_kg   NUMERIC(8, 3),
      ean         VARCHAR(50),
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_dropship_products_sku      ON dropship_products (sku);
    CREATE INDEX IF NOT EXISTS idx_dropship_products_category ON dropship_products (category);
    CREATE INDEX IF NOT EXISTS idx_dropship_products_stock    ON dropship_products (stock);
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS dropship_orders (
      id                  SERIAL PRIMARY KEY,
      reference           VARCHAR(100) NOT NULL UNIQUE,
      wholesaler_order_id VARCHAR(100),
      status              VARCHAR(50)  NOT NULL DEFAULT 'pending',
      payload             JSONB        NOT NULL,
      error_message       TEXT,
      created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS idx_dropship_orders_reference ON dropship_orders (reference);
    CREATE INDEX IF NOT EXISTS idx_dropship_orders_status    ON dropship_orders (status);
  `);

  console.log("Migration complete.");
  await db.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
