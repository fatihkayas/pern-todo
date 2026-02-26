/**
 * Smoke Test — Phase 3.4 SRE Baseline
 *
 * Purpose : Verify all critical endpoints are reachable after deploy.
 * Load    : 1 virtual user, 30 seconds.
 * Pass    : 0 errors, p95 < 500ms, all checks green.
 *
 * Run: k6 run load-tests/smoke.js
 *      k6 run --env BASE_URL=https://myhost:8443 load-tests/smoke.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const errorRate = new Rate("errors");
const watchLatency = new Trend("watch_list_latency");

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],       // < 1% errors
    http_req_duration: ["p(95)<500"],     // p95 under 500ms
    errors: ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5001";

export default function () {
  // 1. Health probe
  const health = http.get(`${BASE_URL}/health`);
  check(health, {
    "health: status 200": (r) => r.status === 200,
    'health: body ok': (r) => r.json("status") === "ok",
  }) || errorRate.add(1);

  // 2. Readiness probe
  const ready = http.get(`${BASE_URL}/ready`);
  check(ready, {
    "ready: status 200 or 503": (r) => r.status === 200 || r.status === 503,
  }) || errorRate.add(1);

  // 3. Watch catalogue
  const watches = http.get(`${BASE_URL}/api/v1/watches`);
  watchLatency.add(watches.timings.duration);
  check(watches, {
    "watches: status 200": (r) => r.status === 200,
    "watches: returns array": (r) => Array.isArray(r.json()),
    "watches: not empty": (r) => r.json().length > 0,
  }) || errorRate.add(1);

  // 4. Metrics endpoint (Prometheus scrape)
  const metrics = http.get(`${BASE_URL}/metrics`);
  check(metrics, {
    "metrics: status 200": (r) => r.status === 200,
    "metrics: text/plain content-type": (r) =>
      r.headers["Content-Type"].includes("text/plain"),
  }) || errorRate.add(1);

  sleep(1);
}
