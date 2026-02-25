# 🚀 Seiko Watch Store — Engineering Roadmap

> **Project:** Tissot/Seiko Watch Store — AI-Native Cloud Commerce Platform
> **Stack:** PERN + TypeScript + AI + Observability + Multi-Cloud
> **Started:** February 2026
> **Goal:** Production-grade, AI-native, multi-cloud e-commerce platform
> **Discipline Rule:** No skipping steps. Each phase builds on the previous.

---

## 📦 Release Strategy

| Version | Scope | Status |
|---|---|---|
| v0.9.0 | Phase 1 Complete — Commerce Core + Stripe + Security | ✅ Released |
| v1.0.0 | TypeScript + Testing + API Contract | 🔄 In Progress |
| v1.1.0 | Observability Stack (Prometheus + Grafana + Loki) | ⏳ Planned |
| v2.0.0 | Azure Production Deployment | ⏳ Planned |
| v2.1.0 | AWS Multi-Cloud Deployment | ⏳ Planned |
| v3.0.0 | Kubernetes + GitOps | ⏳ Planned |
| v4.0.0 | AI-Native Autonomous Platform | ⏳ Planned |

---

## ✅ Current Stack (v0.9.0)

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 18 + Bootstrap | ✅ Running |
| Backend | Node.js + Express | ✅ Running |
| Database | PostgreSQL 15 | ✅ Running |
| Auth | JWT (bcryptjs) | ✅ Running |
| Containers | Podman + podman-compose | ✅ Running |
| Reverse Proxy | Nginx + HTTPS (mkcert) | ✅ Running |
| Payments | Stripe (Payment Intents) | ✅ Running |
| AI Chatbot | Claude API + Ollama | ✅ Running |
| Validation | Zod (all endpoints) | ✅ Running |
| Security | Helmet + Rate Limiting + CORS | ✅ Running |
| Project Mgmt | Jira + GitHub | ✅ Running |

### Running Services
```
seiko_db         → PostgreSQL 15      :5432
seiko_backend    → Express API        :5000
seiko_frontend   → React App          :3000
seiko_nginx      → Nginx HTTPS        :8443
seiko_adminer    → DB Admin UI        :8082
seiko_ollama     → Ollama LLM         :11434
keycloak_server  → Keycloak (standby) :8080
```

---

## ✅ Phase 1 — Commerce Core (RELEASED v0.9.0)

> Phase 1 officially closed.

### Completed
- [x] Product catalog — 28 Tissot watches with images
- [x] Product detail pages
- [x] Shopping cart (sidebar, quantity management)
- [x] Drag & drop product reordering
- [x] Dark mode + Toast notifications
- [x] JWT authentication (register, login, logout)
- [x] Admin panel (dashboard, orders, inventory)
- [x] Order history (My Orders page)
- [x] Stripe Payment Intents + Checkout page
- [x] Order confirmation after payment
- [x] Claude API chatbot + Ollama local LLM
- [x] HTTPS locally (mkcert)
- [x] Helmet.js + CORS + Rate limiting
- [x] Zod validation on all endpoints
- [x] Parameterized SQL queries
- [x] Jira project setup + GitHub integration

---

## 🔄 Phase 2 — Engineering Maturity (v1.0.0) — CURRENT

> **Goal:** Move from functional app to production-grade architecture.
> **Timeline:** March 2026

### Sprint 1 — TypeScript Migration (Week 1–2)
- [x] Create `typescript-migration` branch
- [x] Install TypeScript + ts-node in backend
- [x] tsconfig.json setup (strict mode, ES2020, outDir: dist/)
- [x] Convert `server/index.js` → `index.ts`
- [x] Convert `routes/auth.js` → `auth.ts`
- [x] Convert `routes/orders.js` → `orders.ts`
- [x] Convert `routes/stripe.js` → `stripe.ts`
- [x] Convert `routes/admin.js` → `admin.ts`
- [x] Convert `routes/chat.js` → `chat.ts`
- [x] Convert `middleware/validate.js` → `validate.ts`
- [x] Convert `db.js` → `db.ts`, `schemas.js` → `schemas.ts`
- [x] Shared DTO types (`server/types/index.ts` — Watch, Customer, Order, AuthPayload)
- [x] Express Request extended with `customer?: AuthPayload` (`types/express.d.ts`)
- [x] Dockerfile updated: `npm run build` → `node dist/index.js`
- [x] Zero TypeScript type errors (`tsc --noEmit` clean)
- [x] Container rebuilt and verified running (SCRUM-14)
- [ ] Frontend: migrate components to TypeScript (.tsx)

### Sprint 2 — Testing + Code Quality (Week 3–4)
- [x] Jest + Supertest — backend unit & integration tests (83 tests, 86% coverage — SCRUM-15)
- [ ] React Testing Library — frontend component tests
- [x] Test coverage report (target ≥ 70%) — achieved 86% (SCRUM-15)
- [x] Stripe webhook test coverage (SCRUM-15)
- [x] Auth flow test coverage (SCRUM-15)
- [x] ESLint + Prettier configuration (SCRUM-15)
- [x] Husky pre-commit hooks (type-check + lint-staged — SCRUM-15)
- [x] Conventional commits enforcement (commitlint — SCRUM-15)
- [ ] OpenAPI / Swagger documentation
- [ ] Postman collection export
- [ ] API versioning (/api/v1)

**Deliverable:** Release v1.0.0

---

## ⏳ Phase 3 — Observability & SRE (v1.1.0)

> **Goal:** Make the system measurable and production-ready.
> **Timeline:** April 2026

### 3.1 Metrics
- [ ] Prometheus /metrics endpoint
- [ ] API latency (RED metrics — Rate, Errors, Duration)
- [ ] Claude token usage metric
- [ ] Order throughput metric
- [ ] Stock level metric
- [ ] Grafana dashboards

### 3.2 Logging
- [ ] Structured logging (Pino)
- [ ] Correlation ID middleware
- [ ] Loki + Promtail integration
- [ ] ELK stack for analytics

### 3.3 Alerting
- [ ] Low stock alert
- [ ] High error rate alert
- [ ] Payment failure alert

### 3.4 Reliability
- [ ] Health check (/health)
- [ ] Readiness check (/ready)
- [ ] k6 load testing
- [ ] SLO definition + error budget

### 3.5 CI/CD
- [ ] GitHub Actions: test pipeline on every push
- [ ] GitHub Actions: Docker image build & push to GHCR
- [ ] Dependency security scanning (Snyk + Trivy)
- [ ] Staging environment

**Deliverable:** Release v1.1.0

---

## ⏳ Phase 4 — Azure Production (v2.0.0)

> **Goal:** First cloud deployment — Azure Container Apps
> **Timeline:** May–June 2026

| Service | Azure Solution |
|---|---|
| Container Runtime | Azure Container Apps |
| Container Registry | Azure Container Registry (ACR) |
| Database | Azure Database for PostgreSQL |
| Secrets | Azure Key Vault |
| CDN | Azure Front Door |
| Monitoring | Azure Monitor + Application Insights |
| IaC | Terraform / Bicep |

### Learning Topics
- Azure Resource Manager & Resource Groups
- Azure DevOps Pipelines
- Managed Identity (secretless auth)
- AZ-900 → AZ-204 certification path

**Deliverable:** Release v2.0.0

---

## ⏳ Phase 5 — AWS Multi-Cloud (v2.1.0)

> **Goal:** Vendor-neutral portability
> **Timeline:** July–August 2026

| Service | AWS Solution |
|---|---|
| Container Runtime | ECS Fargate |
| Container Registry | Amazon ECR |
| Database | RDS PostgreSQL (Multi-AZ) |
| Load Balancer | Application Load Balancer |
| DNS + SSL | Route 53 + ACM |
| Secrets | AWS Secrets Manager |
| CDN | CloudFront |
| Storage | S3 |

### Learning Topics
- IAM: users, roles, policies
- VPC: subnets, security groups
- ECS Task Definitions & Services
- CloudWatch dashboards
- AWS CDK or Terraform
- AWS Cloud Practitioner → Solutions Architect

**Deliverable:** Release v2.1.0

---

## ⏳ Phase 6 — Kubernetes & GitOps (v3.0.0)

> **Goal:** Container orchestration at scale
> **Timeline:** September 2026

- [ ] Minikube local setup (Podman driver)
- [ ] Helm charts for all services
- [ ] AKS (Azure Kubernetes Service)
- [ ] EKS (Amazon Elastic Kubernetes Service)
- [ ] ArgoCD or Flux GitOps
- [ ] Horizontal Pod Autoscaler
- [ ] OpenShift Sandbox (free tier)
- [ ] Distributed tracing (Jaeger / OpenTelemetry)
- [ ] Service Mesh: Istio or Linkerd (optional)

**Deliverable:** Release v3.0.0

---

## ⏳ Phase 7 — AI-Native Autonomous Platform (v4.0.0)

> **Goal:** Claude becomes an operational decision layer
> **Timeline:** October 2026+

### 7.1 RAG & Semantic Search
- [ ] pgvector embeddings
- [ ] Semantic product search
- [ ] Context injection from DB

### 7.2 Autonomous Stock Agent
- [ ] Prometheus → webhook trigger
- [ ] Claude Tool Use for CRUD operations
- [ ] Automatic reorder calculation
- [ ] Decision logging (AgentOps)

### 7.3 LLMOps
- [ ] Prompt versioning
- [ ] Token cost monitoring
- [ ] Model fallback (Claude → Ollama)
- [ ] A/B prompt testing
- [ ] AI decision observability

### 7.4 Event-Driven Architecture
- [ ] Kafka for order events
- [ ] Event sourcing pattern
- [ ] CQRS

### 7.5 Modern Languages
- [ ] Go — high-performance microservices
- [ ] GraphQL API layer
- [ ] Rust — performance-critical components (optional)

**Deliverable:** Release v4.0.0

---

## 🎓 Certifications Roadmap

| Certification | Provider | Timeline | Priority |
|---|---|---|---|
| Azure Fundamentals (AZ-900) | Microsoft | May 2026 | High |
| Azure Developer Associate (AZ-204) | Microsoft | Jul 2026 | High |
| AWS Cloud Practitioner | AWS | Aug 2026 | High |
| AWS Solutions Architect Associate | AWS | Oct 2026 | High |
| Certified Kubernetes Administrator (CKA) | CNCF | 2027 | Medium |

---

## 📚 Technology Learning Order

> No skipping. Each builds on the previous.

1. **TypeScript** — type-safe JavaScript (now)
2. **Jest + Testing** — professional quality assurance
3. **Prometheus + Grafana** — observability
4. **GitHub Actions** — CI/CD automation
5. **Terraform** — Infrastructure as Code
6. **Azure** — first cloud deployment
7. **AWS** — multi-cloud strategy
8. **Kubernetes** — container orchestration
9. **Go** — backend microservices
10. **Kafka** — event-driven architecture
11. **Rust** — performance-critical systems (future)

---

## 📅 Timeline

| Period | Phase | Release | Goal |
|---|---|---|---|
| Feb 2026 | Phase 1 | v0.9.0 | ✅ Core app, auth, admin, Stripe, AI |
| Mar 2026 | Phase 2 | v1.0.0 | TypeScript migration, Jest tests |
| Apr 2026 | Phase 3 | v1.1.0 | Prometheus, Grafana, GitHub Actions |
| May–Jun 2026 | Phase 4 | v2.0.0 | Azure Container Apps, Terraform |
| Jul–Aug 2026 | Phase 5 | v2.1.0 | AWS ECS, RDS, CloudFront |
| Sep 2026 | Phase 6 | v3.0.0 | Kubernetes (AKS/EKS), ArgoCD |
| Oct 2026+ | Phase 7 | v4.0.0 | AI Agent, Kafka, Go, MLOps |

---

## 💼 Why This Project Stands Out

1. **Production thinking from day one** — security, observability, containerization built-in
2. **Versioned releases** — professional delivery with clear milestones
3. **AI integration with real impact** — Claude as operational layer, not decoration
4. **Multi-cloud strategy** — Azure + AWS with no vendor lock-in
5. **Full payment system** — real Stripe integration, not a demo
6. **Professional workflow** — Jira sprints, GitHub Actions, conventional commits
7. **Cloud-native trajectory** — every decision made with Kubernetes in mind
8. **Disciplined learning path** — no skipping steps

---

> 📝 Living document — updated after each sprint.
> Last updated: February 2026
