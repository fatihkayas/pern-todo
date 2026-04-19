"use strict";

require("dotenv").config();

const cron = require("./cron");
const logger = require("./logger");

logger.info("[dropshipping] Service starting");

cron.start();

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("[dropshipping] SIGTERM received — shutting down");
  cron.stop();
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("[dropshipping] SIGINT received — shutting down");
  cron.stop();
  process.exit(0);
});
