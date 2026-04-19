"use strict";

const https = require("https");
const logger = require("./logger");

const BASE_URL = process.env.DROPSHIP_BASE_URL || "https://dropshippingb2b.com/api/";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Wraps payload in the required { data: JSON.stringify(payload) } format
 * and POSTs to the given endpoint. Retries on network/5xx errors.
 */
async function post(endpoint, payload, retries = MAX_RETRIES) {
  const url = `${BASE_URL}${endpoint}`;
  const body = JSON.stringify({ data: JSON.stringify(payload) });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchPost(url, body);

      if (!response.success) {
        // rc < 0 = hard error, rc = 1 = info message — both non-success
        const err = new Error(response.message || `API error rc=${response.rc}`);
        err.rc = response.rc;
        err.apiError = true;
        throw err;
      }

      return response;
    } catch (err) {
      const isRetryable = !err.apiError; // only retry network/5xx, not API logic errors
      const isLastAttempt = attempt === retries;

      if (isRetryable && !isLastAttempt) {
        logger.warn(`[apiClient] attempt ${attempt} failed: ${err.message} — retrying in ${RETRY_DELAY_MS * attempt}ms`);
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      throw err;
    }
  }
}

function fetchPost(url, body) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        if (res.statusCode >= 500) {
          return reject(new Error(`HTTP ${res.statusCode} from API`));
        }
        try {
          resolve(JSON.parse(raw));
        } catch {
          reject(new Error(`Invalid JSON response: ${raw.slice(0, 100)}`));
        }
      });
    });

    req.on("error", reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error("Request timed out after 15s"));
    });

    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

module.exports = { post };
