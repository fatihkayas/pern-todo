# Load Tests — k6

Three test profiles for Phase 3.4 SRE baseline.

## Prerequisites

```bash
# Install k6 (Windows)
winget install k6 --source winget
# or
choco install k6

# macOS
brew install k6
```

## Running

```bash
# Smoke — 1 VU, 30s, just verify all endpoints respond
k6 run load-tests/smoke.js

# Stress — ramp 5 → 50 VUs over 7 minutes, find breaking point
k6 run load-tests/stress.js

# Soak — 10 VUs for 30 minutes, watch for memory leaks in Grafana
k6 run load-tests/soak.js

# Quick soak (5 min dev check)
k6 run --env DURATION=5m load-tests/soak.js

# Against staging / production
k6 run --env BASE_URL=https://myhost:8443 load-tests/stress.js

# With auth token (for /orders/my coverage)
k6 run --env AUTH_TOKEN=<jwt> load-tests/stress.js

# Save results as JSON for later analysis
k6 run --out json=results/stress-$(date +%Y%m%d).json load-tests/stress.js
```

## SLOs Being Validated

| Metric | Threshold |
|--------|-----------|
| Error rate | < 1% |
| p95 latency | < 500ms |

## Grafana During Load Tests

Watch these panels while a test runs:
- **Request Rate** — should climb with VUs
- **p95 Latency** — must stay below 500ms
- **Error Rate** — must stay below 1%
- **Node.js Heap Used** — must be flat (soak test)
- **Event Loop Lag** — must stay below 100ms
