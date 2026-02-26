/**
 * Soak Test — Phase 3.4 SRE Baseline
 *
 * Purpose : Detect memory leaks, connection pool exhaustion, or slow
 *           degradation that only appears under sustained load.
 * Load    : 10 VUs for 30 minutes (reduce to 5m with --env DURATION=5m for quick runs).
 * Watch   : nodejs_heap_size_used_bytes in Grafana — should be flat, not climbing.
 *
 * Run: k6 run load-tests/soak.js
 *      k6 run --env DURATION=5m load-tests/soak.js   (quick dev check)
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

const DURATION = __ENV.DURATION || "30m";

export const options = {
  stages: [
    { duration: "2m", target: 10 },    // ramp up
    { duration: DURATION, target: 10 }, // sustained load
    { duration: "2m", target: 0 },     // ramp down
  ],
  thresholds: {
    http_req_failed:   ["rate<0.01"],   // SLO: < 1% errors throughout
    http_req_duration: ["p(95)<500"],   // SLO: p95 under 500ms throughout
    errors:            ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:5001";

export default function () {
  // Simple steady-state traffic mix
  const res = http.get(`${BASE_URL}/api/v1/watches`);
  check(res, {
    "200": (r) => r.status === 200,
    "has data": (r) => r.json().length > 0,
  }) || errorRate.add(1);

  sleep(1);
}
