# Seiko Watch Store — Engineering Roadmap

> **Project:** Seiko Watch Store — AI-Native Cloud Commerce Platform
> **Stack:** PERN + TypeScript + Go + Observability + CI/CD + Multi-Cloud
> **Started:** February 2026
> **Discipline Rule:** No skipping steps. Each phase builds on the previous.

---

## Release Strategy

| Version | Scope | Status |
| --- | --- | --- |
| v0.9.0 | Phase 1 — Commerce Core + Stripe + Security | ✅ Released |
| v1.0.0 | Phase 2 — TypeScript + Testing + API Contract | ✅ Released |
| v1.1.0 | Phase 3 — Observability + CI/CD + SRE Foundations | ✅ Released |
| v2.0.0 | Phase 4 — Azure Production Deployment | ✅ Released |
| v2.1.0 | Phase 5 — Trigger.dev + Async Jobs + Transactional Email | ✅ Released |
| v3.0.0 | Phase 6 — Event-Driven Integration Platform (Go + Kafka) | 🔄 In Progress |
| v3.1.0 | Phase 6.1 — GCP Terraform + CI Rebuild + Test Expansion | ✅ Released |
| v3.2.0 | Phase 6.2 — AWS ECS + RDS Production Deployment (Terraform) | ✅ Released |
| v3.3.0 | Phase 6.3 — GCP Cloud Run + Cloud SQL Deployment | 📋 Planned |
| v3.4.0 | Phase 6.4 — Resilience Layer | ✅ Released |
| v3.5.0 | Phase 6.5 — Integration Observability | ✅ Released |
| v3.6.0 | Phase 6.6 — Chaos Engineering | ✅ Released |
| v3.7.0 | Phase 6.7 — AI Log Analyzer | ✅ Released |
| v4.0.0 | Phase 7 — Multi-Cloud Kafka (AWS MSK + Azure EventHub) | 📋 Planned |
| v5.0.0 | Phase 8 — Kubernetes + GitOps | 📋 Planned |
| v6.0.0 | Phase 9 — AI-Native Autonomous Platform | 📋 Planned |

---

## Current Stack (v3.7.0)

| Layer | Technology | Status |
| --- | --- | --- |
| Frontend | React 18 + TypeScript (.tsx) | ✅ Running |
| Backend | Node.js + Express + TypeScript | ✅ Running |
| Database | PostgreSQL 15 | ✅ Running |
| Auth | Keycloak (OIDC + JWKS) | ✅ Running |
| Containers | Podman + podman-compose | ✅ Running |
| Reverse Proxy | Nginx + HTTPS (mkcert) | ✅ Running |
| Payments | Stripe (Payment Intents + Webhooks) | ✅ Running |
| AI Chatbot | Claude API (Anthropic) | ✅ Running |
| Validation | Zod (all endpoints) | ✅ Running |
| Security | Helmet + Rate Limiting + CORS | ✅ Running |
| Metrics | Prometheus + prom-client | ✅ Running |
| Dashboards | Grafana (auto-provisioned) | ✅ Running |
| Logging | Pino (structured JSON) + Correlation ID | ✅ Running |
| API Docs | Swagger / OpenAPI | ✅ Running |
| CI/CD | GitHub Actions + GHCR (updated) | ✅ Running |
| Testing | Backend: 100 tests, 97% coverage · Frontend: 44 RTL tests · E2E: 23 Playwright tests | ✅ Running |
| Code Quality | ESLint + Prettier + Husky + commitlint | ✅ Running |
| Message Broker | Redpanda (Kafka-compatible) | 🔄 Active |
| Kafka Producer | TypeScript (server/kafka/producer.ts) | 🔄 Active |
| Integration Service | Go microservice (consumer + adapters) | 🔄 Active |
| ServiceNow Adapter | Go (adapters/servicenow.go) | 🔄 Active |
| AWS RDS Config | server/config/aws-rds.js | 🔄 Active |
| Multi-Agent Docs | AGENTS.md + GEMINI.md | 🔄 Active |
| GCP Terraform | Cloud Run · Cloud SQL · Artifact Registry (written, not deployed) | 📋 Ready |
| AWS Terraform | VPC · ECR · RDS deployed · ECS/ALB/Secrets pending | 🔄 Active |
| CI/CD (rebuilt) | GitHub Actions (218-line update) | 🔄 Active |

### Running Services
```
seiko_db              → PostgreSQL 15            :5433 (host) / :5432 (internal)
seiko_backend         → Express API              :5001 (host) / :5000 (internal)
seiko_frontend        → React App                :3000 (host) / :8080 (internal)
seiko_nginx           → Nginx HTTPS              :8443 / :8090
seiko_adminer         → DB Admin UI              :8082
keycloak_server       → Keycloak IAM             :8080
seiko_prometheus      → Prometheus               :9090
seiko_grafana         → Grafana                  :3001
seiko_alertmanager    → Alertmanager             :9093
redpanda              → Kafka-compatible broker   :9092
redpanda_console      → Redpanda Console         :8084
seiko_integration     → Go microservice          :8083 (host) / :8080 (internal)
```

---

## Phase 1 — Commerce Core ✅ RELEASED v0.9.0

- [x] Product catalog — 28 watches with images
- [x] Shopping cart (sidebar, quantity management, drag & drop)
- [x] Dark mode + Toast notifications
- [x] JWT authentication (register, login, logout)
- [x] Admin panel (dashboard, orders, inventory)
- [x] Order history (My Orders page)
- [x] Stripe Payment Intents + Checkout + Webhook verification
- [x] Order confirmation after payment
- [x] Ollama LLM chatbot (llama3.2, SSE streaming)
- [x] HTTPS locally (mkcert + Nginx reverse proxy)
- [x] Helmet.js + CORS + Rate limiting
- [x] Zod validation on all endpoints
- [x] Parameterized SQL queries (SQL injection prevention)
- [x] Jira project setup + GitHub integration

---

## Phase 2 — Engineering Maturity ✅ RELEASED v1.0.0

### Sprint 1 — TypeScript Migration
- [x] tsconfig.json (strict mode, ES2020, outDir: dist/)
- [x] Full backend migration: all `.js` → `.ts`
- [x] Shared DTO types (`server/types/index.ts`)
- [x] Zod schemas migrated
- [x] Dockerfile updated: `npm run build` → `node dist/index.js`
- [x] Zero TypeScript errors (`tsc --noEmit` clean)
- [x] Full frontend migration — 19 components converted to `.tsx`

### Sprint 2 — Testing + Code Quality
- [x] Jest + Supertest — 78 tests, 86% coverage
- [x] ESLint v8 + Prettier configured
- [x] Husky pre-commit hooks (type-check + lint-staged)
- [x] Conventional commits enforced (commitlint)
- [x] OpenAPI / Swagger documentation on all endpoints
- [x] API versioning — all routes under `/api/v1/`
- [x] Postman collection exported

---

## Phase 3 — Observability & SRE ✅ RELEASED v1.1.0

### 3.1 Metrics ✅
- [x] Prometheus `/metrics` endpoint via `prom-client`
- [x] RED metrics middleware — `http_requests_total`, `http_request_duration_ms`
- [x] Default Node.js metrics — heap, GC, event loop lag, CPU
- [x] `orders_created_total`, `orders_revenue_dollars_total`
- [x] `watches_low_stock_total` — async DB gauge
- [x] `ollama_chat_requests_total` + `ollama_chat_duration_ms` histogram
- [x] Grafana auto-provisioned — Prometheus datasource + backend dashboard

### 3.2 Logging ✅
- [x] Structured JSON logging with Pino (replaces morgan)
- [x] `pino-pretty` for local development
- [x] `pino-http` request logging with custom log levels
- [x] Correlation ID middleware — `x-correlation-id` propagated on all responses
- [x] Health + metrics endpoints excluded from access log noise

### 3.3 Reliability ✅
- [x] Health check `GET /health` — always 200 if process alive
- [x] Readiness check `GET /ready` — live DB connectivity check, 503 if unavailable

### 3.4 CI/CD ✅
- [x] GitHub Actions — tsc + eslint + jest with coverage on every push
- [x] GitHub Actions — Docker build & push to GHCR on `main` (updated in v3.0)
- [x] Image tagged with `:latest` and `:<git-sha>`
- [x] Coverage HTML report uploaded as CI artifact

---

## Phase 4 — Azure Production ✅ RELEASED v2.0.0

- [x] Terraform modules: resource group, ACR, Container Apps environment
- [x] Secrets migrated to Key Vault references
- [x] Managed Identity for secretless DB + Key Vault access
- [x] Multi-stage Dockerfile (builder + runtime)
- [x] HTTPS via Azure Front Door + custom domain
- [x] GitHub Actions deploy job: push to ACR → update Container App revision
- [x] Azure Monitor alerts

---

## Phase 5 — Trigger.dev + Async AI ✅ RELEASED v2.1.0

- [x] Trigger.dev background job runner integrated
- [x] Async Claude chat (offloaded to queue — no HTTP timeouts)
- [x] Daily AI-generated business report (orders, revenue, stock trends)
- [x] Low-stock alert → autonomous Claude reorder pipeline
- [x] Event-driven order confirmation + inventory update
- [x] Resend transactional email on order events

---

## Phase 6 — Event-Driven Integration Platform 🔄 In Progress → v3.0.0

> Goal: Build a real enterprise integration layer with Kafka and Go.
> Status: Kafka producer live, Go consumer live, ServiceNow adapter implemented.

### 6.0 Foundation ✅ Done
- [x] Redpanda added to `podman-compose.yml`
- [x] Kafka producer — `server/kafka/producer.ts` publishes `order.placed` events
- [x] Kafka client initialization — `server/kafka/index.ts`
- [x] `server/routes/orders.ts` updated to emit Kafka event on order creation
- [x] Go integration-service scaffolded (`main.go`, Dockerfile, go.mod)
- [x] Kafka consumer — `integration-service/consumer/consumer.go`
- [x] ServiceNow adapter — `integration-service/adapters/servicenow.go`
- [x] Multi-agent documentation — `server/AGENTS.md`, `server/GEMINI.md`
- [x] AWS RDS connection config — `server/config/aws-rds.js`
- [x] CI/CD workflow updated for Go build

### 6.1 — GCP Terraform + CI + Tests ✅ Done
- [x] GCP Terraform root module — `infra/gcp/main.tf` (Cloud Run + Cloud SQL + Artifact Registry wired)
- [x] GCP module: `cloud_run/` — Cloud Run service, IAM bindings, traffic splitting
- [x] GCP module: `cloud_sql/` — PostgreSQL, private IP, automated backups
- [x] GCP module: `artifact_registry/` — container registry, lifecycle policies
- [x] `infra/gcp/variables.tf` + `infra/gcp/outputs.tf`
- [x] CI/CD pipeline rebuilt — `.github/workflows/ci.yml` (218-line update, Go build included)
- [x] `.gitignore` updated for GCP and Go artifacts
- [x] `server/__tests__/orders.test.ts` — expanded (+22 lines)
- [x] `server/__tests__/schemas.test.ts` — expanded (+18 lines)
- [x] `server/index.ts` updated (startup + health improvements)
- [x] `server/routes/stripe.ts` — webhook hardening (+27 lines)
- [x] `podman-compose.yml` updated — new service entries
- [x] Backend API tests fully expanded — 100 tests, 97% route coverage (KAN-65)
- [x] Frontend component/service tests — 44 RTL tests across 5 test files (KAN-66)
- [x] E2E browser tests — 23 Playwright tests, webServer auto-start (KAN-67)
- [x] CI `e2e` job added to GitHub Actions — Playwright chromium install + report artifact

### 6.2 — AWS ECS + RDS Production Deployment ✅ Done

- [x] Terraform root module — `infra/aws/main.tf` (VPC + ECR + RDS + ALB + ECS + CloudWatch + Secrets)
- [x] AWS module: `vpc/` — VPC, public + private subnets, Internet Gateway
- [x] AWS module: `ecr/` — backend + frontend container repositories
- [x] AWS module: `rds/` — PostgreSQL 15 RDS instance, subnet group, parameter group, encryption
- [x] AWS module: `alb/` — Application Load Balancer, path-based routing (`/api/*` → backend, `/*` → frontend)
- [x] AWS module: `ecs/` — ECS Fargate cluster, task definitions (backend 512 CPU/1GB, frontend 256/512), services
- [x] AWS module: `cloudwatch/` — log groups, dashboard (CPU/mem/ALB/RDS), 4 alarms
- [x] AWS module: `secrets/` — Secrets Manager for DB password, Stripe keys, JWT
- [x] GitHub Actions OIDC role — ECR push + ECS update without stored credentials
- [x] Container images built with Podman and pushed to ECR (`eu-central-1`)
- [x] `client/Dockerfile` — build ARGs for `REACT_APP_STRIPE_PUBLISHABLE_KEY` + `REACT_APP_API_URL`, PORT=3000
- [x] `client/src/config.ts` — `window.location.origin` fallback for same-ALB routing
- [x] DB migrations + seed ran against RDS PostgreSQL (`aws-rds` Sequelize env)
- [x] All seeder image URLs migrated from Google Drive to Unsplash CDN
- [x] App live at `http://seiko-alb-1474380243.eu-central-1.elb.amazonaws.com`

**Deliverable:** Release v3.2.0 ✅

### 6.3 — GCP Cloud Run + Cloud SQL Deployment 📋 Planned

- [x] Terraform root module — `infra/gcp/main.tf` (Cloud Run + Cloud SQL + Artifact Registry)
- [x] GCP module: `artifact_registry/` — container registry + lifecycle policies
- [x] GCP module: `cloud_sql/` — PostgreSQL, private IP, automated backups
- [x] GCP module: `cloud_run/` — Cloud Run service, IAM bindings, traffic splitting
- [x] Workload Identity Federation — GitHub Actions OIDC (no long-lived keys)
- [x] Secret Manager — DB password, Stripe keys, JWT secret
- [ ] `terraform apply` — deploy all GCP resources
- [ ] Push container images to Artifact Registry
- [ ] Run DB migrations against Cloud SQL
- [ ] Verify app running on Cloud Run URL

### 6.4 — Resilience Layer ✅ Done
- [x] Retry + exponential backoff on Kafka consumer (1s → 2s → 4s, 3 attempts)
- [x] Circuit breaker (gobreaker) on ServiceNow adapter — open after 5 consecutive failures
- [x] Idempotency check — skip duplicate order events via `integration_logs` table
- [x] Dead letter queue — failed messages routed to `orders.created.dlq` topic
- [x] Graceful shutdown on SIGTERM/SIGINT — consumer stops, HTTP server drains (15s timeout)
- [x] New Prometheus metrics: `integration_events_retried_total`, `integration_events_dlq_total`, `integration_events_skipped_total`, `integration_circuit_breaker_state`

### 6.5 — Integration Observability ✅ Done
- [x] Prometheus scrape config — `integration-service:8080/metrics` added to `prometheus.yml`
- [x] Grafana dashboard — `grafana/dashboards/integration.json` (9 panels: rate, success %, latency p50/p95/p99, retry/DLQ rate, circuit breaker state, totals)
- [x] Alert rules — 4 new rules in `prometheus/alerts.yml`: IntegrationServiceDown, IntegrationHighFailureRate, IntegrationDLQMessages, IntegrationCircuitBreakerOpen
- [x] Metrics already live in consumer.go: consumed, failed, retried, dlq, skipped, duration, circuit_breaker_state

### 6.6 — Chaos Engineering ✅ Done
- [x] `SERVICENOW_CHAOS_FAILURE_RATE` env var — injects random failures at N% rate for live testing
- [x] `consumer_test.go` — 10 chaos tests covering retry, circuit breaker, DLQ, invalid JSON
- [x] `TestWithRetry_*` — 4 tests: success, succeed-after-retry, exhaust-retries, CB-open-no-retry
- [x] `TestCircuitBreaker_OpensAfterFiveFailures` — verifies CB trips correctly
- [x] `TestProcessRecord_*` — 5 tests: happy path, transient retry, DLQ on exhaustion, invalid JSON, open CB blocks adapter
- [x] `backoffFn` injectable — tests run in <2ms (zero real sleep)

### 6.7 — AI Log Analyzer ✅ Done

- [x] `server/trigger/integration-log-analyzer.ts` — Trigger.dev scheduled task (every hour)
- [x] Queries `integration_logs` for failures in the last 60 minutes
- [x] Claude claude-opus-4-6 root-cause analysis → categorized JSON (network_timeout, http_5xx, circuit_breaker_open, chaos_injection, etc.)
- [x] Auto-creates Jira issue via REST API v3 (priority mapped to severity: low/medium/high/critical)
- [x] Skips Jira issue creation for low-severity findings
- [x] Appends audit row to `integration_logs` with analysis metadata (severity, jiraKey, summary)
- [x] Graceful no-op when Jira not configured (JIRA_BASE_URL/JIRA_EMAIL/JIRA_API_TOKEN unset)

**Deliverable:** Release v3.0.0 ✅

---

## Phase 7 — Multi-Cloud Kafka ⏳ v4.0.0

> Goal: Move Kafka to managed cloud services, test failover.
> Timeline: June 2026

| Layer | AWS | Azure | GCP |
| --- | --- | --- | --- |
| Kafka | AWS MSK | Azure EventHub (Kafka protocol) | Pub/Sub (adapter) |
| IaC | Terraform aws provider | Terraform azurerm provider | Terraform google provider |
| Consumer | Same Go service, broker URL change | Same Go service | Same Go service |
| Container | ECS Fargate | Container Apps | Cloud Run |

### Key Tasks
- [ ] Terraform module: AWS MSK cluster + IAM
- [ ] Terraform module: Azure EventHub namespace + AMQP/Kafka endpoint
- [ ] Integration-service broker URL via environment variable (no code change)
- [ ] Failover simulation: switch broker mid-load-test
- [ ] Cost + latency comparison documented

**Deliverable:** Release v4.0.0

---

## Phase 8 — Kubernetes & GitOps ⏳ v5.0.0

> Goal: Container orchestration at scale — cloud-portable.
> Timeline: September 2026

### Local Cluster
- [ ] Minikube (Podman driver)
- [ ] Convert podman-compose services to Kubernetes manifests
- [ ] Helm chart for backend, frontend, integration-service, Prometheus, Grafana

### GitOps
- [ ] ArgoCD or Flux for GitOps-driven deployments
- [ ] Image update automation (new tag → auto-sync)
- [ ] Horizontal Pod Autoscaler (CPU + custom Kafka consumer lag metric)

### Cloud Kubernetes
- [ ] AKS (Azure) — deploy Helm chart
- [ ] EKS (AWS) — same chart, different provider
- [ ] PodDisruptionBudget for zero-downtime deploys

### Observability at K8s Level
- [ ] OpenTelemetry + Jaeger (distributed tracing)
- [ ] Prometheus Operator + ServiceMonitor CRDs
- [ ] Loki on Kubernetes (Helm chart)
- [ ] Service Mesh: Istio or Linkerd (optional)

**Deliverable:** Release v5.0.0

---

## Phase 9 — AI-Native Autonomous Platform ⏳ v6.0.0

> Goal: Claude becomes an operational decision layer, not just a chatbot.
> Timeline: October 2026+

### 9.1 RAG & Semantic Search
- [ ] pgvector — vector embeddings in PostgreSQL
- [ ] Embed watch descriptions + reviews into vectors
- [ ] Semantic product search (natural language → nearest neighbor)
- [ ] Context injection: live inventory injected into Claude prompts

### 9.2 Autonomous Stock Agent
- [ ] Prometheus alert → webhook → Claude Tool Use
- [ ] Claude tool: `list_low_stock_watches`, `create_reorder_request`
- [ ] Automatic reorder threshold calculation
- [ ] Decision log table in PostgreSQL (AgentOps pattern)

### 9.3 LLMOps
- [ ] Prompt versioning (store prompts in DB, track changes)
- [ ] Token cost monitoring — track spend per model per day
- [ ] Model fallback strategy: Claude primary → Ollama on failure
- [ ] A/B prompt testing framework
- [ ] AI decision observability in Grafana

### 9.4 GraphQL + Go Microservices
- [ ] Go — rewrite high-throughput endpoints as microservices
- [ ] GraphQL API layer (federated, replacing some REST endpoints)

**Deliverable:** Release v6.0.0

---

## Certifications Roadmap

| Certification | Provider | Target | Status |
| --- | --- | --- | --- |
| Azure Fundamentals (AZ-900) | Microsoft | May 2026 | ⏳ |
| Azure Developer Associate (AZ-204) | Microsoft | Jul 2026 | ⏳ |
| AWS Cloud Practitioner | AWS | Aug 2026 | ⏳ |
| AWS Solutions Architect Associate | AWS | Oct 2026 | ⏳ |
| Certified Kubernetes Administrator (CKA) | CNCF | 2027 | ⏳ |

---

## Technology Learning Order

1. **TypeScript** ✅ Done
2. **Jest + Testing** ✅ Done
3. **Prometheus + Grafana** ✅ Done
4. **GitHub Actions** ✅ Done
5. **Pino + Structured Logging** ✅ Done
6. **Kafka (Redpanda)** ✅ Done
7. **Go** ✅ Done
8. **Adapter Pattern / Enterprise Integration** ✅ Done
9. **Alerting** — Prometheus rules + Alertmanager ✅ Done
10. **k6** — load testing and SLO definition ✅ Done
11. **Chaos Engineering** ✅ Done
12. **AI Log Analysis** — Claude + Jira auto-issue creation ✅ Done
13. **Terraform** — Infrastructure as Code (Azure + AWS + GCP) ✅ Done
14. **AWS MSK / Azure EventHub / GCP Pub/Sub** ⏳ Phase 7
15. **Kubernetes** ⏳ Phase 8
16. **OpenTelemetry** ⏳ Phase 8
17. **GraphQL** ⏳ Phase 9

---

## Timeline

| Period | Phase | Release | Goal |
| --- | --- | --- | --- |
| Feb 2026 | Phase 1 | v0.9.0 | ✅ Core commerce, auth, Stripe, AI chatbot |
| Feb–Mar 2026 | Phase 2 | v1.0.0 | ✅ TypeScript, Jest 86%, Swagger, CI |
| Mar–Apr 2026 | Phase 3 | v1.1.0 | ✅ Prometheus, Grafana, Pino, GitHub Actions CI/CD |
| Apr–May 2026 | Phase 4 | v2.0.0 | ✅ Azure Container Apps, Terraform, Key Vault |
| May 2026 | Phase 5 | v2.1.0 | ✅ Trigger.dev, async Claude, transactional email |
| Mar–May 2026 | Phase 6 | v3.0.0 | 🔄 Redpanda, Go integration-service, ServiceNow adapter |
| Mar–Apr 2026 | Phase 6.1 | v3.1.0 | ✅ GCP Terraform (Cloud Run · Cloud SQL · AR), CI rebuild, 100 backend + 44 RTL + 23 E2E tests |
| Apr 2026 | Phase 6.2 | v3.2.0 | ✅ AWS ECS Fargate + RDS live on ALB (eu-central-1), Unsplash image URLs, config.ts same-origin routing |
| Apr 2026 | Phase 6.3 | v3.3.0 | 📋 GCP Cloud Run + Cloud SQL deploy (`terraform apply`) |
| Apr 2026 | Phase 6.4 | v3.4.0 | ✅ Resilience: retry, circuit breaker, idempotency, DLQ, graceful shutdown |
| Apr 2026 | Phase 6.5 | v3.5.0 | ✅ Integration observability: Grafana dashboard, Prometheus scrape, 4 alert rules |
| Apr 2026 | Phase 6.6 | v3.6.0 | ✅ Chaos engineering: SERVICENOW_CHAOS_FAILURE_RATE, 10 consumer_test.go tests |
| Apr 2026 | Phase 6.7 | v3.7.0 | ✅ AI Log Analyzer: Claude claude-opus-4-6 root-cause analysis, Jira auto-issue creation |
| Jun 2026 | Phase 7 | v4.0.0 | ⏳ AWS MSK, Azure EventHub, failover simulation |
| Sep 2026 | Phase 8 | v5.0.0 | ⏳ Kubernetes (AKS/EKS), Helm, ArgoCD, OTel |
| Oct 2026+ | Phase 9 | v6.0.0 | ⏳ RAG, Autonomous Agent, LLMOps, GraphQL |

---

## Why This Project Stands Out

1. **SRE from day one** — RED metrics, structured logging, health/readiness probes, alerting rules
2. **Versioned releases** — professional delivery with clear milestones and commit traceability
3. **Observable by design** — every business event has a Prometheus metric
4. **Event-driven in practice** — Kafka producer (TypeScript) + Go consumer + ServiceNow adapter. Running services, not diagrams.
5. **Multi-language architecture** — TypeScript backend, Go integration service, Terraform IaC
6. **AI integration with real operational impact** — Claude agent with Tool Use, multi-model strategy, AGENTS.md + GEMINI.md
7. **Multi-cloud strategy** — Azure deployed, AWS in progress, same app — different cloud
8. **Disciplined progression** — no skipping, certifications aligned to phases

---

> Living document — updated after each sprint.
> Last updated: March 2026 · v3.8.0 Released · Phases 6.0–6.7 + 6.2 complete (v3.0.0–v3.8.0) · 8 GitHub Releases published · Next: Phase 6.3 (GCP Cloud Run terraform apply)
