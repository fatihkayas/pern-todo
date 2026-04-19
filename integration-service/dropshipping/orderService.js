"use strict";

const { post } = require("./apiClient");
const { getToken, invalidate } = require("./authService");
const { handle } = require("./errorHandler");
const db = require("./db");
const logger = require("./logger");

/**
 * Validates order payload before sending to the wholesaler.
 * Throws on invalid data so we never send a bad order.
 */
function validateOrder(order) {
  const errors = [];

  if (!order.reference || typeof order.reference !== "string") {
    errors.push("order.reference is required (string)");
  }
  if (!Array.isArray(order.items) || order.items.length === 0) {
    errors.push("order.items must be a non-empty array");
  } else {
    order.items.forEach((item, i) => {
      if (!item.sku) errors.push(`items[${i}].sku is required`);
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        errors.push(`items[${i}].quantity must be a positive integer`);
      }
    });
  }
  if (!order.shipping?.name) errors.push("order.shipping.name is required");
  if (!order.shipping?.address) errors.push("order.shipping.address is required");
  if (!order.shipping?.city) errors.push("order.shipping.city is required");
  if (!order.shipping?.country) errors.push("order.shipping.country is required (ISO 3166-1 alpha-2)");
  if (!order.shipping?.postal_code) errors.push("order.shipping.postal_code is required");

  if (errors.length) {
    const err = new Error(`Order validation failed:\n  ${errors.join("\n  ")}`);
    err.validationErrors = errors;
    throw err;
  }
}

/**
 * Sends an order to the wholesaler.
 * Saves a dropship_orders record and updates status on response.
 *
 * @param {object} order
 * @param {string} order.reference   — your internal order ID
 * @param {Array}  order.items       — [{ sku, quantity }]
 * @param {object} order.shipping    — { name, address, city, country, postal_code, phone? }
 * @returns {{ ok: boolean, wholesaler_order_id?, message? }}
 */
async function sendOrder(order) {
  // 1. Validate
  try {
    validateOrder(order);
  } catch (err) {
    logger.error("[orderService] Validation error", { errors: err.validationErrors });
    return { ok: false, code: "VALIDATION_ERROR", message: err.message };
  }

  // 2. Prevent duplicate submission
  const existing = await db.query(
    "SELECT id, status FROM dropship_orders WHERE reference = $1",
    [order.reference]
  );
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    logger.warn(`[orderService] Order ${order.reference} already submitted (status: ${row.status})`);
    return { ok: false, code: "DUPLICATE", message: `Order already exists with status: ${row.status}` };
  }

  // 3. Record intent
  await db.query(
    `INSERT INTO dropship_orders (reference, status, payload, created_at, updated_at)
     VALUES ($1, 'pending', $2, NOW(), NOW())`,
    [order.reference, JSON.stringify(order)]
  );

  // 4. Send to API
  try {
    const token = await getToken();
    const res = await post("order", { token, ...order });

    const wholesaler_order_id = res.order_id ?? res.data?.order_id ?? null;

    await db.query(
      `UPDATE dropship_orders
       SET status = 'submitted', wholesaler_order_id = $1, updated_at = NOW()
       WHERE reference = $2`,
      [wholesaler_order_id, order.reference]
    );

    logger.info(`[orderService] Order ${order.reference} submitted — wholesaler ID: ${wholesaler_order_id}`);
    return { ok: true, wholesaler_order_id };
  } catch (err) {
    if (err.rc === -1) invalidate();

    await db.query(
      `UPDATE dropship_orders
       SET status = 'failed', error_message = $1, updated_at = NOW()
       WHERE reference = $2`,
      [err.message, order.reference]
    );

    return handle("orderService.sendOrder", err);
  }
}

module.exports = { sendOrder };
