# Seiko Watch Store — Engineering Roadmap

> **Project:** Seiko Watch Store — AI-Native Cloud Commerce Platform
> **Stack:** PERN + TypeScript + Observability + CI/CD + Multi-Cloud
> **Started:** February 2026
> **Discipline Rule:** No skipping steps. Each phase builds on the previous.

---

## Release Strategy

| Version | Scope | Status |
|---|---|---|
| v0.9.0 | Phase 1 — Commerce Core + Stripe + Security | ✅ Released |
| v1.0.0 | Phase 2 — TypeScript + Testing + API Contract | ✅ Released |
| v1.1.0 | Phase 3 — Observability + CI/CD + SRE Foundations | 🔄 In Progress |
| v2.0.0 | Phase 4 — Azure Production Deployment | ⏳ Planned |
| v2.1.0 | Phase 5 — AWS Multi-Cloud | ⏳ Planned |
| v3.0.0 | Phase 6 — Kubernetes + GitOps | ⏳ Planned |
| v4.0.0 | Phase 7 — AI-Native Autonomous Platform | ⏳ Planned |

---

## Current Stack (v1.1.0-dev)

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 18 + TypeScript (.tsx) | ✅ Running |
| Backend | Node.js + Express + TypeScript | ✅ Running |
| Database | PostgreSQL 15 | ✅ Running |
| Auth | JWT (bcryptjs) | ✅ Running |
| Containers | Podman + podman-compose | ✅ Running |
| Reverse Proxy | Nginx + HTTPS (mkcert) | ✅ Running |
| Payments | Stripe (Payment Intents + Webhooks) | ✅ Running |
| AI Chatbot | Ollama (llama3.2) | ✅ Running |
| Validation | Zod (all endpoints) | ✅ Running |
| Security | Helmet + Rate Limiting + CORS | ✅ Running |
| Metrics | Prometheus + prom-client | ✅ Running |
| Dashboards | Grafana (auto-provisioned) | ✅ Running |
| Logging | Pino (structured JSON) + Correlation ID | ✅ Running |
| API Docs | Swagger / OpenAPI | ✅ Running |
| CI/CD | GitHub Actions + GHCR | ✅ Running |
| Testing | Jest + Supertest (78 tests, 86% coverage) | ✅ Running |
| Code Quality | ESLint + Prettier + Husky + commitlint | ✅ Running |

### Running Services
```
seiko_db         → PostgreSQL 15      :5432
seiko_backend    → Express API        :5001 (host) / :5000 (internal)
seiko_frontend   → React App          :3000
seiko_nginx      → Nginx HTTPS        :8443 / :8090
seiko_adminer    → DB Admin UI        :8082
seiko_ollama     → Ollama LLM         :11434
keycloak_server  → Keycloak IAM       :8080
seiko_prometheus → Prometheus         :9090
seiko_grafana    → Grafana            :3001
```

---

## Phase 1 — Commerce Core ✅ RELEASED v0.9.0

> Phase 1 officially closed.

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

> Goal: Move from functional app to production-grade architecture.

### Sprint 1 — TypeScript Migration
- [x] tsconfig.json (strict mode, ES2020, outDir: dist/)
- [x] Full backend migration: all `.js` → `.ts`
- [x] Shared DTO types (`server/types/index.ts` — Watch, Customer, Order, AuthPayload)
- [x] Express Request extended with `customer?: AuthPayload`
- [x] Zod schemas migrated (`z.coerce.number()`, `z.email()`)
- [x] Dockerfile updated: `npm run build` → `node dist/index.js`
- [x] Zero TypeScript errors (`tsc --noEmit` clean)
- [x] Full frontend migration — 19 components converted to `.tsx` (KAN-29)

### Sprint 2 — Testing + Code Quality
- [x] Jest + Supertest — 78 tests, 86% coverage (SCRUM-15)
- [x] ESLint v8 + Prettier configured
- [x] Husky pre-commit hooks (type-check + lint-staged)
- [x] Conventional commits enforced (commitlint)
- [x] OpenAPI / Swagger documentation on all endpoints (SCRUM-16)
- [x] API versioning — all routes under `/api/v1/` (SCRUM-16)
- [x] Postman collection exported (SCRUM-17)

---

## Phase 3 — Observability & SRE 🔄 In Progress → v1.1.0

> Goal: Make the system measurable, observable, and production-ready.

### 3.1 Metrics ✅ Done
- [x] Prometheus `/metrics` endpoint via `prom-client` (KAN-39)
- [x] RED metrics middleware — `http_requests_total`, `http_request_duration_ms` (KAN-39)
- [x] Default Node.js metrics — heap, GC, event loop lag, CPU (KAN-39)
- [x] `orders_created_total` — order throughput counter (KAN-40)
- [x] `orders_revenue_dollars_total` — cumulative revenue counter (KAN-40)
- [x] `watches_low_stock_total` — async DB gauge (queries on each scrape) (KAN-40)
- [x] `ollama_chat_requests_total` + `ollama_chat_duration_ms` histogram (KAN-40)
- [x] Grafana auto-provisioned — Prometheus datasource + backend dashboard (KAN-43)

### 3.2 Logging ✅ Done
- [x] Structured JSON logging with Pino (replaces morgan) (KAN-41)
- [x] `pino-pretty` for local development (colorized, human-readable)
- [x] `pino-http` request logging with custom log levels (5xx=error, 4xx=warn)
- [x] Correlation ID middleware — `x-correlation-id` propagated on all responses (KAN-41)
- [x] Health + metrics endpoints excluded from access log noise (KAN-41)
- [ ] Loki + Promtail — log aggregation into Grafana
- [ ] Log-based alerting (error spike detection)

### 3.3 Alerting ⏳ Next
- [ ] Prometheus alerting rules file (`prometheus/alerts.yml`)
  - `WatchesLowStock` — fires when `watches_low_stock_total > 5`
  - `HighErrorRate` — fires when 5xx rate > 5% over 5 minutes
  - `BackendDown` — fires when backend unreachable for > 1 minute
  - `PaymentFailureSpike` — fires on elevated Stripe webhook failures
- [ ] Alertmanager config — route alerts to webhook / email
- [ ] Alertmanager added to `podman-compose.yml`
- [ ] Alert panels in Grafana dashboard (firing/resolved state)

### 3.4 Reliability ✅ Done
- [x] Health check `GET /health` — always 200 if process alive (KAN-41)
- [x] Readiness check `GET /ready` — live DB connectivity check, 503 if unavailable (KAN-41)
- [ ] k6 load test baseline script (`load-tests/smoke.js`, `load-tests/stress.js`)
- [ ] SLO definition: 99.5% availability, p95 latency < 500ms
- [ ] Error budget tracking in Grafana

### 3.5 CI/CD ✅ Done
- [x] GitHub Actions — tsc + eslint + jest with coverage on every push (KAN-42)
- [x] GitHub Actions — Docker build & push to GHCR on `main` (KAN-42)
- [x] Image tagged with `:latest` and `:<git-sha>` (KAN-42)
- [x] Coverage HTML report uploaded as CI artifact (KAN-42)
- [ ] Trivy container image vulnerability scan in CI
- [ ] Dependabot for automated dependency updates
- [ ] Staging environment (compose override)

**Deliverable:** Release v1.1.0 — pending alerting rules + k6 baseline

---

## Phase 4 — Azure Production ⏳ v2.0.0

> Goal: First cloud deployment on managed PaaS.
> Timeline: May–June 2026

| Layer | Azure Service |
|---|---|
| Container Runtime | Azure Container Apps |
| Container Registry | Azure Container Registry (ACR) |
| Database | Azure Database for PostgreSQL (Flexible Server) |
| Secrets | Azure Key Vault + Managed Identity |
| CDN / Ingress | Azure Front Door |
| Monitoring | Azure Monitor + Application Insights |
| IaC | Terraform (azurerm provider) |
| CI push to ACR | GitHub Actions + OIDC (no stored credentials) |

### Key Tasks
- [ ] Terraform modules: resource group, ACR, Container Apps environment
- [ ] Migrate secrets from `.env` to Key Vault references
- [ ] Managed Identity for secretless DB + Key Vault access
- [ ] Multi-stage Dockerfile (builder + runtime) to reduce image size
- [ ] HTTPS via Azure Front Door + custom domain
- [ ] GitHub Actions deploy job: push to ACR → update Container App revision
- [ ] Azure Monitor alerts wired to existing Grafana or Azure Dashboard

### Learning Targets
- Azure Resource Manager + Resource Groups
- Managed Identity (no username/password in code)
- OIDC federation (GitHub → Azure, no long-lived secrets)
- AZ-900 → AZ-204 certification path

**Deliverable:** Release v2.0.0

---

## Phase 5 — AWS Multi-Cloud ⏳ v2.1.0

> Goal: Vendor-neutral portability — same app, different cloud.
> Timeline: July–August 2026

| Layer | AWS Service |
|---|---|
| Container Runtime | ECS Fargate |
| Container Registry | Amazon ECR |
| Database | RDS PostgreSQL (Multi-AZ) |
| Load Balancer | Application Load Balancer |
| DNS + TLS | Route 53 + ACM |
| Secrets | AWS Secrets Manager |
| CDN | CloudFront |
| Storage | S3 (static assets) |
| IaC | Terraform (aws provider) or AWS CDK |

### Key Tasks
- [ ] ECS Task Definition + Service + ALB target group
- [ ] RDS Multi-AZ PostgreSQL with automated backups
- [ ] IAM roles with least-privilege for ECS tasks
- [ ] CloudWatch dashboards + alarms
- [ ] GitHub Actions: push to ECR → update ECS service (rolling deploy)
- [ ] Compare cost + SLA vs Azure deployment

### Learning Targets
- IAM: roles, policies, instance profiles
- VPC: subnets, security groups, NAT gateway
- ECS Task Definitions + service auto-scaling
- AWS Cloud Practitioner → Solutions Architect Associate

**Deliverable:** Release v2.1.0

---

## Phase 6 — Kubernetes & GitOps ⏳ v3.0.0

> Goal: Container orchestration at scale — cloud-portable.
> Timeline: September 2026

### Local Cluster
- [ ] Minikube (Podman driver) — local Kubernetes environment
- [ ] kubectl + Helm basics
- [ ] Convert podman-compose services to Kubernetes manifests

### Helm + GitOps
- [ ] Helm chart for backend, frontend, Prometheus, Grafana
- [ ] ArgoCD or Flux for GitOps-driven deployments
- [ ] Image update automation (new tag → auto-sync to cluster)

### Cloud Kubernetes
- [ ] AKS (Azure Kubernetes Service) — deploy Helm chart
- [ ] EKS (Amazon Elastic Kubernetes Service) — same chart
- [ ] Horizontal Pod Autoscaler based on CPU + custom metrics
- [ ] PodDisruptionBudget for zero-downtime deploys

### Observability at K8s Level
- [ ] Distributed tracing with OpenTelemetry + Jaeger
- [ ] Prometheus Operator + ServiceMonitor CRDs
- [ ] Loki on Kubernetes (Helm chart)
- [ ] Service Mesh: Istio or Linkerd (optional — mTLS, traffic shaping)

### Other
- [ ] OpenShift Sandbox (free tier) for Red Hat exposure

### Learning Targets
- Kubernetes objects: Deployment, Service, Ingress, ConfigMap, Secret
- RBAC for service accounts
- Certified Kubernetes Administrator (CKA) preparation

**Deliverable:** Release v3.0.0

---

## Phase 7 — AI-Native Autonomous Platform ⏳ v4.0.0

> Goal: Claude becomes an operational decision layer, not just a chatbot.
> Timeline: October 2026+

### 7.1 RAG & Semantic Search
- [ ] pgvector extension — vector embeddings in PostgreSQL
- [ ] Embed watch descriptions + reviews into vectors
- [ ] Semantic product search (natural language → nearest neighbor)
- [ ] Context injection: live inventory injected into Claude prompts

### 7.2 Autonomous Stock Agent
- [ ] Prometheus alert → webhook → Claude Tool Use
- [ ] Claude tool: `list_low_stock_watches`, `create_reorder_request`
- [ ] Automatic reorder threshold calculation
- [ ] Decision log table in PostgreSQL (AgentOps pattern)

### 7.3 LLMOps
- [ ] Prompt versioning (store prompts in DB, track changes)
- [ ] Token cost monitoring — track spend per model per day
- [ ] Model fallback strategy: Claude primary → Ollama on failure
- [ ] A/B prompt testing framework
- [ ] AI decision observability in Grafana

### 7.4 Event-Driven Architecture
- [ ] Kafka for order events (order.placed, order.shipped, order.cancelled)
- [ ] Event sourcing pattern — orders as immutable event log
- [ ] CQRS — separate read/write models for orders

### 7.5 Modern Languages
- [ ] Go — rewrite high-throughput endpoints as microservices
- [ ] GraphQL API layer (federated, replacing some REST endpoints)
- [ ] Rust — performance-critical components (optional / stretch goal)

**Deliverable:** Release v4.0.0

---

## Certifications Roadmap

| Certification | Provider | Target | Status |
|---|---|---|---|
| Azure Fundamentals (AZ-900) | Microsoft | May 2026 | ⏳ |
| Azure Developer Associate (AZ-204) | Microsoft | Jul 2026 | ⏳ |
| AWS Cloud Practitioner | AWS | Aug 2026 | ⏳ |
| AWS Solutions Architect Associate | AWS | Oct 2026 | ⏳ |
| Certified Kubernetes Administrator (CKA) | CNCF | 2027 | ⏳ |

---

## Technology Learning Order

> No skipping. Each builds on the previous.

1. **TypeScript** — type-safe JavaScript ✅ Done
2. **Jest + Testing** — professional quality assurance ✅ Done
3. **Prometheus + Grafana** — metrics and dashboards ✅ Done
4. **GitHub Actions** — CI/CD automation ✅ Done
5. **Pino + Loki** — structured logging and aggregation 🔄 In Progress
6. **Alerting** — Prometheus rules + Alertmanager ⏳ Next
7. **k6** — load testing and SLO definition ⏳ Next
8. **Terraform** — Infrastructure as Code ⏳ Phase 4
9. **Azure** — first cloud deployment ⏳ Phase 4
10. **AWS** — multi-cloud portability ⏳ Phase 5
11. **Kubernetes** — container orchestration ⏳ Phase 6
12. **OpenTelemetry** — distributed tracing ⏳ Phase 6
13. **Kafka** — event-driven architecture ⏳ Phase 7
14. **Go** — high-performance microservices ⏳ Phase 7

---

## Timeline

| Period | Phase | Release | Goal |
|---|---|---|---|
| Feb 2026 | Phase 1 | v0.9.0 | ✅ Core commerce, auth, Stripe, AI chatbot |
| Feb–Mar 2026 | Phase 2 | v1.0.0 | ✅ TypeScript, Jest 86%, Swagger, CI foundations |
| Mar–Apr 2026 | Phase 3 | v1.1.0 | 🔄 Prometheus, Grafana, Pino, GitHub Actions CI/CD |
| May–Jun 2026 | Phase 4 | v2.0.0 | ⏳ Azure Container Apps, Terraform, Key Vault |
| Jul–Aug 2026 | Phase 5 | v2.1.0 | ⏳ AWS ECS Fargate, RDS, CloudFront |
| Sep 2026 | Phase 6 | v3.0.0 | ⏳ Kubernetes (AKS/EKS), Helm, ArgoCD, OTel |
| Oct 2026+ | Phase 7 | v4.0.0 | ⏳ RAG, Autonomous Agent, Kafka, Go, LLMOps |

---

## Why This Project Stands Out

1. **SRE from day one** — RED metrics, structured logging, health/readiness probes, alerting rules — not added as an afterthought
2. **Versioned releases** — professional delivery with clear milestones and commit traceability
3. **Observable by design** — every business event (order, revenue, stock, chat) has a Prometheus metric
4. **GitOps-ready** — CI enforces quality gates (tsc, eslint, jest) and CD pushes SHA-tagged images to GHCR
5. **AI integration with real operational impact** — Prometheus → Claude autonomous agent in Phase 7
6. **Multi-cloud strategy** — Azure + AWS with Terraform, no vendor lock-in
7. **Full payment system** — real Stripe integration with webhook signature verification, not a demo
8. **Disciplined progression** — no skipping, each phase builds on the previous, certifications aligned to phases

---

> Living document — updated after each sprint.
> Last updated: February 2026 (Phase 3 in progress)
