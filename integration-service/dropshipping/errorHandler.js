"use strict";

const logger = require("./logger");

/**
 * Centralised error handler. Call this in catch blocks.
 * Returns a normalised { ok: false, code, message } object — never throws.
 */
function handle(context, err) {
  const code = err.rc ?? "NETWORK_ERROR";
  const message = err.message || "Unknown error";

  if (err.apiError) {
    // API-level error (rc < 0 or rc = 1)
    if (err.rc < 0) {
      logger.error(`[${context}] API hard error rc=${err.rc}: ${message}`);
    } else {
      logger.warn(`[${context}] API message rc=${err.rc}: ${message}`);
    }
  } else {
    logger.error(`[${context}] Network/system error: ${message}`, { stack: err.stack });
  }

  return { ok: false, code, message };
}

module.exports = { handle };
