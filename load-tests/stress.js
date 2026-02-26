/**
 * Stress Test — Phase 3.4 SRE Baseline
 *
 * Purpose : Find the point at which the backend starts degrading.
 *           Ramps from 5 → 50 VUs over 5 minutes, then backs off.
 * SLO     : p95 < 500ms, error rate < 1% — both must hold at peak load.
 *
 * Run: k6 run load-tests/stress.js
 *      k6 run --out json=results/stress-$(date +%Y%m%d).json load-tests/stress.js
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const watchLatency = new Trend("watch_list_latency_ms");

export const options = {
  stages: [
    { duration: "1m", target: 5 },   // warm-up
    { duration: "2m", target: 20 },  // ramp to moderate load
    { duration: "2m", target: 50 },  // peak stress
    { duration: "1m", target: 20 },  // scale back
    { duration: "1m", target: 0 },   // cool-down
  ],
  thresholds: {
    http_req_failed:   ["rate<0.01"],    // SLO: < 1% errors
    http_req_duration: ["p(95)<500"],    // SLO: p95 under 500ms
    errors:            ["rate<0.01"],
    watch_list_latency_ms: ["p(95)<500"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5001";

// Shared headers for authenticated requests (optional — set via env)
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";
const authHeaders = AUTH_TOKEN
  ? { Authorization: `Bearer ${AUTH_TOKEN}` }
  : {};

export default function () {
  // Weight distribution: catalogue is the hottest path
  const rand = Math.random();

  if (rand < 0.60) {
    // 60% — Browse catalogue (anonymous, cacheable)
    const res = http.get(`${BASE_URL}/api/v1/watches`);
    watchLatency.add(res.timings.duration);
    check(res, {
      "watches: 200": (r) => r.status === 200,
      "watches: array": (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);

  } else if (rand < 0.80) {
    // 20% — Health + readiness probes (simulate k8s kubelet)
    const h = http.get(`${BASE_URL}/health`);
    check(h, { "health: 200": (r) => r.status === 200 }) || errorRate.add(1);

  } else if (rand < 0.95) {
    // 15% — Authenticated: my orders
    if (AUTH_TOKEN) {
      const res = http.get(`${BASE_URL}/api/v1/orders/my`, {
        headers: authHeaders,
      });
      check(res, {
        "orders/my: 200 or 401": (r) => r.status === 200 || r.status === 401,
      }) || errorRate.add(1);
    } else {
      // Without token, expect 401
      const res = http.get(`${BASE_URL}/api/v1/orders/my`);
      check(res, { "orders/my: 401 without token": (r) => r.status === 401 });
    }

  } else {
    // 5% — Prometheus metrics scrape
    const res = http.get(`${BASE_URL}/metrics`);
    check(res, { "metrics: 200": (r) => r.status === 200 }) || errorRate.add(1);
  }

  sleep(Math.random() * 0.5 + 0.1); // 100–600ms think time
}
