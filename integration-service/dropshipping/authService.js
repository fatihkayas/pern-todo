"use strict";

const { post } = require("./apiClient");
const { handle } = require("./errorHandler");
const logger = require("./logger");

const USERNAME = process.env.DROPSHIP_USERNAME;
const PASSWORD = process.env.DROPSHIP_PASSWORD;

// In-memory session token cache
let _token = null;
let _tokenExpiry = 0; // epoch ms
let _loginPromise = null;

/**
 * Returns a valid session token, logging in if needed.
 * Tokens are cached until they expire (default: 55 min safety margin).
 */
async function getToken() {
  if (_token && Date.now() < _tokenExpiry) {
    return _token;
  }

  if (!_loginPromise) {
    _loginPromise = login().finally(() => {
      _loginPromise = null;
    });
  }

  return _loginPromise;
}

async function login() {
  if (!USERNAME || !PASSWORD) {
    throw new Error("DROPSHIP_USERNAME and DROPSHIP_PASSWORD must be set in environment");
  }

  try {
    const res = await post("login", { username: USERNAME, password: PASSWORD });
    _token = res.token ?? res.session ?? res.data?.token;

    if (!_token) {
      throw new Error("Login response did not contain a token");
    }

    // Cache for 55 minutes (most wholesaler sessions last 60 min)
    _tokenExpiry = Date.now() + 55 * 60 * 1000;
    logger.info("[authService] Login successful, token cached for 55 min");
    return _token;
  } catch (err) {
    handle("authService.login", err);
    throw err; // re-throw so callers know auth failed
  }
}

/** Force a fresh login (call after 401-equivalent API errors) */
function invalidate() {
  _token = null;
  _tokenExpiry = 0;
}

module.exports = { getToken, invalidate };
