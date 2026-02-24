# 🚀 Seiko Watch Store — Engineering Roadmap

> **Project:** Tissot/Seiko Watch Store — AI-Native Cloud Commerce Platform
> **Stack:** PERN (PostgreSQL, Express, React, Node.js)
> **Started:** February 2026
> **Goal:** Production-ready, AI-native, multi-cloud e-commerce platform

---

## ✅ Current Status (February 2026)

| Layer | Technology | Status |
|---|---|---|
| Frontend | React 18 + Bootstrap | ✅ Running |
| Backend | Node.js + Express | ✅ Running |
| Database | PostgreSQL 15 | ✅ Running |
| Auth | JWT (bcryptjs) | ✅ Running |
| Containers | Podman + podman-compose | ✅ Running |
| Reverse Proxy | Nginx + HTTPS (mkcert) | ✅ Running |
| DB Admin | Adminer | ✅ Running |
| AI Chatbot | Claude API (Anthropic) | ✅ Running |
| Payments | Stripe (Test Mode) | ✅ Running |
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

## ✅ Completed Features

### 🛍️ E-Commerce Core
- [x] Product catalog — 28 Tissot watches with images
- [x] Product detail pages
- [x] Shopping cart (sidebar, quantity management)
- [x] Drag & drop product reordering
- [x] Dark mode
- [x] Toast notifications (react-hot-toast)

### 🔐 Authentication
- [x] JWT-based registration & login
- [x] bcryptjs password hashing
- [x] Protected routes
- [x] Admin role (is_admin flag)

### 📦 Orders
- [x] Order creation with customer_id
- [x] Order history (My Orders page)
- [x] Stock management on order

### 🛠️ Admin Panel
- [x] Dashboard (orders, revenue, customers, stock)
- [x] Order status management
- [x] Inventory management

### 💳 Stripe Payment
- [x] Stripe Payment Intent API
- [x] Checkout page with Stripe Elements
- [x] Order confirmation after payment
- [x] Secure payment (card data never stored)

### 🤖 AI Integration
- [x] Claude API chatbot (floating widget)
- [x] Conversation history
- [x] Rate limiting
- [x] Ollama local LLM (llama3.2)

### 🔒 Security
- [x] HTTPS locally (mkcert)
- [x] Helmet.js security headers
- [x] CORS configuration
- [x] Rate limiting (express-rate-limit)
- [x] Parameterized SQL queries
- [x] Environment variables (.env)

---

## 🗺️ Phases Overview

```
Phase 1 → App Development      (Feb – Mar 2026)   ████████░░  80% done
Phase 2 → TypeScript + Tests   (Mar – Apr 2026)   ░░░░░░░░░░  starting
Phase 3 → CI/CD & DevOps       (Apr 2026)         ░░░░░░░░░░  planned
Phase 4 → Azure Deployment     (May – Jun 2026)   ░░░░░░░░░░  planned
Phase 5 → AWS Deployment       (Jul – Aug 2026)   ░░░░░░░░░░  planned
Phase 6 → Kubernetes & GitOps  (Sep 2026)         ░░░░░░░░░░  planned
Phase 7 → AI Native & MLOps    (Oct 2026+)        ░░░░░░░░░░  planned
```

---

## Phase 1 — App Development (Completing) ⚙️

### Remaining
- [ ] Stripe Webhook (payment confirmation via webhook)
- [ ] Email confirmation after order
- [x] Zod input validation on all endpoints
- [ ] Global error handling middleware
- [ ] Morgan request logging
- [ ] Password reset flow

---

## Phase 2 — TypeScript + Testing 🔷

> **Focus:** Type safety and test coverage

### 2.1 TypeScript Migration
- [ ] Backend: migrate Express routes to TypeScript
- [ ] Frontend: migrate React components to TypeScript (.tsx)
- [ ] Shared types package (frontend + backend)
- [ ] tsconfig.json setup
- [ ] Type-safe API responses

### 2.2 Testing
- [ ] Jest + Supertest — backend unit & integration tests
- [ ] React Testing Library — frontend component tests
- [ ] Stripe webhook testing (Stripe CLI)
- [ ] Test coverage report (>80%)
- [ ] Selenium / Playwright — E2E tests

### 2.3 Code Quality
- [ ] ESLint + Prettier enforcement
- [ ] Husky pre-commit hooks
- [ ] Conventional commits
- [ ] API documentation (Swagger/OpenAPI)

---

## Phase 3 — CI/CD & DevOps 🔄

> **Focus:** Automate everything

- [ ] GitHub Actions: test pipeline on every push
- [ ] GitHub Actions: Docker image build & push to GHCR
- [ ] Dependency security scanning (Snyk + Trivy)
- [ ] Health check endpoints (/health, /ready)
- [ ] Prometheus metrics endpoint
- [ ] Grafana dashboards (API latency, error rate, revenue)
- [ ] Loki + Promtail log aggregation
- [ ] Alerting rules (low stock, payment failures)
- [ ] Staging environment

---

## Phase 4 — Azure Deployment ☁️

> **Focus:** First cloud deployment — Azure Container Apps

| Service | Azure Solution |
|---|---|
| Container Runtime | Azure Container Apps |
| Container Registry | Azure Container Registry (ACR) |
| Database | Azure Database for PostgreSQL |
| Secrets | Azure Key Vault |
| CDN | Azure Front Door |
| Monitoring | Azure Monitor + Application Insights |
| Auth | Azure AD / Entra ID |

### Learning Topics
- Azure Resource Manager & Resource Groups
- Azure DevOps Pipelines
- Managed Identity (secretless auth)
- Bicep / Terraform for IaC
- AZ-900 → AZ-204 certification path

---

## Phase 5 — AWS Deployment ☁️

> **Focus:** Multi-cloud — AWS production deployment

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
- VPC: subnets, security groups, NAT gateway
- ECS Task Definitions & Services
- CloudWatch alarms and dashboards
- AWS CDK or Terraform
- AWS Cloud Practitioner → Solutions Architect certification

---

## Phase 6 — Kubernetes & GitOps ☸️

> **Focus:** Container orchestration at scale

- [ ] Minikube local setup (Podman driver)
- [ ] Helm charts for all services
- [ ] AKS (Azure Kubernetes Service)
- [ ] EKS (Amazon Elastic Kubernetes Service)
- [ ] ArgoCD or Flux GitOps
- [ ] Horizontal Pod Autoscaler
- [ ] OpenShift Sandbox (free tier)
- [ ] Service Mesh: Istio or Linkerd
- [ ] Distributed tracing: Jaeger / OpenTelemetry

---

## Phase 7 — AI Native & Advanced Tech 🤖

> **Focus:** AI as an operational layer + modern technologies

### 7.1 Advanced AI Integration
- [ ] Claude Tool Use — AI performs CRUD operations via chat
- [ ] RAG pipeline with pgvector embeddings
- [ ] Autonomous stock agent (Prometheus → Claude → reorder)
- [ ] Natural language product search
- [ ] Weekly business summary (Claude + cron job)
- [ ] LLMOps: prompt versioning, A/B testing, cost monitoring
- [ ] AgentOps: every tool-use decision logged

### 7.2 Event-Driven Architecture
- [ ] Kafka for order events
- [ ] Event sourcing pattern
- [ ] CQRS (Command Query Responsibility Segregation)

### 7.3 Modern Languages
- [ ] Go — high-performance microservices
- [ ] Rust — performance-critical components (optional)
- [ ] GraphQL API layer

### 7.4 MLOps
- [ ] Model serving with Ollama
- [ ] Custom fine-tuned model for product recommendations
- [ ] Vector search optimization

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

## 📚 Learning Priority Order

1. **TypeScript** — type-safe JavaScript (critical, do now)
2. **Jest + Testing** — professional quality assurance
3. **GitHub Actions** — CI/CD automation
4. **Terraform** — Infrastructure as Code
5. **Azure** — first cloud deployment
6. **AWS** — multi-cloud strategy
7. **Kubernetes** — container orchestration
8. **Go** — backend microservices
9. **Kafka** — event-driven architecture
10. **Rust** — performance-critical systems (future)

---

## 📅 Updated Timeline

| Period | Phase | Goal |
|---|---|---|
| Feb 2026 | Phase 1 | ✅ Core app, auth, admin, Stripe |
| Mar 2026 | Phase 2 | TypeScript migration, Jest tests |
| Apr 2026 | Phase 3 | GitHub Actions, Prometheus, Grafana |
| May–Jun 2026 | Phase 4 | Azure Container Apps, Terraform |
| Jul–Aug 2026 | Phase 5 | AWS ECS, RDS, CloudFront |
| Sep 2026 | Phase 6 | Kubernetes (AKS/EKS), ArgoCD |
| Oct 2026+ | Phase 7 | AI Agent, Kafka, Go, MLOps |

---

## 💼 Why This Project Stands Out

1. **Production thinking from day one** — security, observability, containerization built-in
2. **AI integration with real impact** — Claude as operational layer, not a chatbot decoration
3. **Multi-cloud strategy** — Azure + AWS with no vendor lock-in
4. **Full payment system** — real Stripe integration, not a demo
5. **Professional workflow** — Jira sprints, GitHub Actions, conventional commits
6. **Cloud-native trajectory** — every decision made with Kubernetes in mind

---

> 📝 Living document — updated after each sprint.
> Last updated: February 2026