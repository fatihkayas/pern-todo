# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

---

## [v3.3.0] — 2026-03-20 — GCP Cloud Run + Cloud SQL

### Added
- GCP Terraform: 32 resources deployed (Cloud Run, Cloud SQL, Artifact Registry, Secret Manager, WIF)
- `deploy-gcp` CI/CD job — every push to `main` auto-deploys to Cloud Run
- Frontend rebuilt with `REACT_APP_API_URL` baked in at build time
- Smoke test step in CI after GCP deploy
- `server/config/gcp-cloudsql.js` for running migrations via Cloud SQL Auth Proxy
- Migration `20260320113000-add-password-hash-to-customers.js` for existing databases

### Fixed
- `password_hash` column missing from initial `customers` migration
- CORS: `CORS_ORIGIN` env var added to Cloud Run backend
- Stripe secret: updated from placeholder to real key in Secret Manager
- Dockerfile CMD: removed `db:migrate` from container startup (caused Cloud Run cold start failure)
- Workload Identity Pool ID changed from `v2` to `v3` (soft-deleted pool blocks recreation for 30 days)

### Infrastructure
- Frontend: `https://seiko-frontend-90422197529.europe-west1.run.app`
- Backend: `https://seiko-backend-90422197529.europe-west1.run.app`
- Cloud SQL: `pern-full-stack-489210:europe-west1:seiko-postgres`

---

## [v3.2.0] — 2026-04 — AWS ECS Fargate + RDS

### Added
- Terraform modules: VPC, ECR, RDS, ALB, ECS, CloudWatch, Secrets Manager
- ECS Fargate: backend (512 CPU/1GB) + frontend (256/512)
- Path-based ALB routing: `/api/*` → backend, `/*` → frontend
- GitHub Actions OIDC for ECR push + ECS update (no stored credentials)
- `client/src/config.ts`: `window.location.origin` fallback for same-ALB routing
- All seeder image URLs migrated to Unsplash CDN (replaced Google Drive links)

### Infrastructure
- App: `http://seiko-alb-1474380243.eu-central-1.elb.amazonaws.com`
- RDS: `seiko-postgres.cvqcmygu8efa.eu-central-1.rds.amazonaws.com`

---

## [v3.1.0] — 2026-03 — GCP Terraform + CI Rebuild + Tests

### Added
- GCP Terraform: Cloud Run, Cloud SQL, Artifact Registry modules (written, not deployed)
- CI/CD pipeline rebuilt — 218-line GitHub Actions workflow
- Backend tests expanded to 100 tests, 97% coverage
- Frontend: 44 RTL component tests
- E2E: 23 Playwright tests with webServer auto-start

---

## [v3.0.0] — 2026-03 — Event-Driven Integration Platform

### Added
- Redpanda (Kafka-compatible) added to `podman-compose.yml`
- Kafka producer: `server/kafka/producer.ts` — publishes `order.placed` events
- Go integration-service: Kafka consumer + ServiceNow adapter
- `AGENTS.md` + `GEMINI.md` multi-agent documentation

---

## [v2.1.0] — 2026-05 — Trigger.dev + Async AI

### Added
- Trigger.dev background job runner
- Async Claude chat (POST → runId, GET /:runId polling)
- Daily AI-generated business report
- Low-stock alert → autonomous reorder pipeline
- Resend transactional email on order events

---

## [v2.0.0] — 2026-04 — Azure Production Deployment

### Added
- Bicep IaC → migrated to Terraform: Resource Group, ACR, Container Apps, PostgreSQL
- UAMI for secretless ACR pull
- GitHub Actions OIDC (federated on main branch)

### Infrastructure
- Frontend: `https://seiko-frontend.ashyground-a8f00237.westeurope.azurecontainerapps.io`
- Backend: `https://seiko-backend.ashyground-a8f00237.westeurope.azurecontainerapps.io`

---

## [v1.1.0] — 2026-03 — Observability + CI/CD

### Added
- Prometheus `/metrics` + RED metrics middleware
- Business metrics: orders, revenue, stock gauge, chat
- Pino structured logging + correlation ID
- Grafana auto-provisioned (datasource + dashboard)
- Prometheus alert rules + Alertmanager
- GitHub Actions CI/CD (tsc + eslint + jest + GHCR push)
- k6 load tests (smoke, stress, soak)

---

## [v1.0.0] — 2026-02 — TypeScript + Testing + API Contract

### Added
- Full TypeScript migration (backend + frontend)
- Jest + Supertest: 78 tests, 86% coverage
- ESLint v8 + Prettier + Husky + commitlint
- OpenAPI / Swagger on all endpoints
- API versioning: all routes under `/api/v1/`
- Postman collection exported

---

## [v0.9.0] — 2026-02 — Commerce Core

### Added
- Product catalog (28 Seiko + Tissot watches)
- Shopping cart with drag & drop
- JWT authentication (register, login, logout)
- Admin panel (dashboard, orders, inventory)
- Stripe Payment Intents + Webhooks
- Ollama LLM chatbot (llama3.2)
- HTTPS locally (mkcert + Nginx)
- Helmet.js + CORS + Rate limiting + Zod validation
