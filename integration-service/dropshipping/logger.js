"use strict";

const levels = ["debug", "info", "warn", "error"];

function log(level, message, meta = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: "dropshipping",
    message,
    ...(Object.keys(meta).length ? { meta } : {}),
  };
  const output = JSON.stringify(entry);
  if (level === "error" || level === "warn") {
    process.stderr.write(output + "\n");
  } else {
    process.stdout.write(output + "\n");
  }
}

const logger = {};
for (const level of levels) {
  logger[level] = (message, meta) => log(level, message, meta);
}

module.exports = logger;
