"use strict";

const { syncProducts } = require("./productService");
const logger = require("./logger");

const INTERVAL_MS = 60 * 60 * 1000; // 1 hour

let _timer = null;

async function runSync() {
  logger.info("[cron] Product sync triggered");
  try {
    const result = await syncProducts();
    logger.info("[cron] Product sync finished", result);
  } catch (err) {
    logger.error("[cron] Product sync threw unexpectedly", { error: err.message });
  }
}

function start() {
  if (_timer) {
    logger.warn("[cron] Scheduler already running; start() ignored");
    return;
  }

  logger.info(`[cron] Scheduler started - syncing every ${INTERVAL_MS / 60000} minutes`);

  // Run immediately on start, then on interval.
  void runSync();
  _timer = setInterval(runSync, INTERVAL_MS);
}

function stop() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
    logger.info("[cron] Scheduler stopped");
  }
}

module.exports = { start, stop };
