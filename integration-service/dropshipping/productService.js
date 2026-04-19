"use strict";

const { post } = require("./apiClient");
const { getToken, invalidate } = require("./authService");
const { handle } = require("./errorHandler");
const db = require("./db");
const logger = require("./logger");

/**
 * Fetches all products from the wholesaler and upserts them into PostgreSQL.
 * Returns { synced, skipped, errors } counts.
 */
async function syncProducts() {
  logger.info("[productService] Starting product sync");

  let products;
  try {
    const token = await getToken();
    const res = await post("products", { token, action: "list" });
    products = res.products ?? res.data ?? [];
  } catch (err) {
    if (err.rc === -1) invalidate(); // session expired — next call will re-login
    handle("productService.fetchProducts", err);
    return { synced: 0, skipped: 0, errors: 1 };
  }

  logger.info(`[productService] Fetched ${products.length} products from API`);

  let synced = 0;
  let skipped = 0;
  let errors = 0;

  for (const product of products) {
    try {
      const wasUpserted = await upsertProduct(product);
      if (wasUpserted) {
        synced++;
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      logger.error("[productService] Failed to upsert product", {
        sku: product.sku,
        error: err.message,
      });
    }
  }

  logger.info(`[productService] Sync complete — synced: ${synced}, skipped: ${skipped}, errors: ${errors}`);
  return { synced, skipped, errors };
}

/**
 * Upserts a single product.
 * Uses ON CONFLICT (sku) to update price & stock without creating duplicates.
 */
async function upsertProduct(product) {
  const {
    sku,
    name,
    description = null,
    price,
    stock = 0,
    category = null,
    image_url = null,
    weight_kg = null,
    ean = null,
  } = product;

  if (!sku || price == null) {
    logger.warn("[productService] Skipping product with missing sku or price", { product });
    return false;
  }

  await db.query(
    `INSERT INTO dropship_products
       (sku, name, description, price, stock, category, image_url, weight_kg, ean, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
     ON CONFLICT (sku) DO UPDATE SET
       name        = EXCLUDED.name,
       description = EXCLUDED.description,
       price       = EXCLUDED.price,
       stock       = EXCLUDED.stock,
       category    = EXCLUDED.category,
       image_url   = EXCLUDED.image_url,
       weight_kg   = EXCLUDED.weight_kg,
       ean         = EXCLUDED.ean,
       updated_at  = NOW()`,
    [sku, name, description, price, stock, category, image_url, weight_kg, ean]
  );

  return true;
}

module.exports = { syncProducts };
