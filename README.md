<div align="center">

# ⌚ Seiko Watch Store
### AI-Native Multi-Cloud Commerce Platform — PERN Stack

[![CI](https://img.shields.io/github/actions/workflow/status/fatihkayas/pern-todo/ci.yml?label=CI&logo=github-actions&logoColor=white&style=flat-square)](https://github.com/fatihkayas/pern-todo)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Go](https://img.shields.io/badge/Go-1.21-00ADD8?style=flat-square&logo=go&logoColor=white)](https://golang.org)
[![Claude AI](https://img.shields.io/badge/Claude-AI%20Agent-CC785C?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![Kafka](https://img.shields.io/badge/Kafka-Event--Driven-231F20?style=flat-square&logo=apachekafka&logoColor=white)](https://kafka.apache.org)
[![Terraform](https://img.shields.io/badge/Terraform-IaC-7B42BC?style=flat-square&logo=terraform&logoColor=white)](https://terraform.io)
[![AWS](https://img.shields.io/badge/AWS-In%20Progress-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Azure](https://img.shields.io/badge/Azure-Planned-0078D4?style=flat-square&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com)
[![GCP](https://img.shields.io/badge/GCP-Terraform%20Ready-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://cloud.google.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A production-oriented, security-first, cloud-ready commerce platform** built with the PERN stack,  
evolving into a fully observable, AI-native, event-driven, **tri-cloud** system with autonomous LLM agents and modular Terraform infrastructure.

[Architecture](#-architecture) · [AI Agent](#-ai-agent--llm-integration) · [Event-Driven](#-event-driven-integration-platform) · [Infrastructure](#-infrastructure-as-code) · [Security](#-security) · [Observability](#-observability) · [Roadmap](#-roadmap) · [Setup](#-getting-started)

</div>

---

## 🎯 What This Project Actually Is

> This is not a CRUD demo. It is not a tutorial project.

This is an **engineering platform** that simulates the architecture of a real production system — built and evolved intentionally to demonstrate:

- **Security by design** — OWASP Top 10 coverage across frontend, backend, and infrastructure
- **Observability-first** — Prometheus, Grafana, Loki, ELK, and Splunk integration
- **AI as an operational layer** — Claude LLM agent with Tool Use, RAG, pgvector, and async Trigger.dev jobs
- **Event-driven architecture** — Kafka/Redpanda with Go integration microservice and adapter pattern (active)
- **Infrastructure-as-Code** — Modular Terraform for AWS (VPC, ECS, RDS, ALB) and GCP (Cloud Run, Cloud SQL, Artifact Registry)
- **Cloud portability** — AWS, Azure, and GCP deployment with no vendor lock-in (tri-cloud)
- **Container orchestration** — Kubernetes-ready, OpenShift-compatible

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│   React SPA · TypeScript · HttpOnly Cookies · CSP · DOMPurify  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY / NGINX                        │
│            Reverse Proxy  ·  SSL Termination  ·  Rate Limit     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND — Express API                       │
│   Keycloak OIDC  ·  RBAC  ·  Zod Validation  ·  Helmet.js      │
│   Parameterized SQL  ·  Rate Limiting  ·  Trigger.dev Async     │
│   Kafka Producer (order.placed events)                          │
└──────────┬───────────────┬───────────────────┬──────────────────┘
           │               │                   │
┌──────────▼─────┐  ┌──────▼──────┐  ┌────────▼────────────────┐
│  PostgreSQL 15 │  │ Claude Agent│  │   Observability Stack    │
│  + pgvector    │  │  Tool Use   │  │  Prometheus · Grafana    │
│  RAG-ready     │  │  RAG / LLM  │  │  Loki · ELK · Splunk    │
└────────────────┘  └─────────────┘  └─────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│              EVENT-DRIVEN INTEGRATION PLATFORM                  │
│   Redpanda (Kafka)  ·  Go integration-service                   │
│   Kafka Consumer  ·  ServiceNow Adapter  ·  Adapter Pattern     │
└──────────┬──────────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                INFRASTRUCTURE AS CODE (Terraform)               │
│   AWS: VPC · ALB · ECS Fargate · RDS · Secrets · CloudWatch    │
│   Azure: Container Apps · AKS · PostgreSQL · Front Door         │
│   GCP: Cloud Run · Cloud SQL · Artifact Registry                │
│   Kubernetes · OpenShift · Helm · ArgoCD                        │        │
└─────────────────────────────────────────────────────────────────┘
```

### Running Services

| Service | Technology | Port |
|---|---|---|
| Frontend | React 18 + TypeScript | `3000` |
| Backend API | Node.js 20 + Express | `5000` |
| Auth Server | Keycloak (OIDC) | `8080` |
| Database | PostgreSQL 15 + pgvector | `5432` |
| DB Admin | Adminer | `8081` |
| Metrics | Prometheus | `9090` |
| Dashboards | Grafana | `3001` |
| Log Aggregation | Loki | `3100` |
| Log Analytics | Kibana (ELK) | `5601` |
| Message Broker | Redpanda (Kafka) | `9092` |
| Integration Service | Go microservice | `8085` |

---

## 🤖 AI Agent & LLM Integration

Claude is used not as a chatbot decoration — but as an **operational layer** with real system impact.

### Current: Secure RAG Chatbot
- Backend proxy pattern — API keys never exposed to client
- System prompt injection with live product context
- Conversation history (last 20 messages) per session
- PostgreSQL-persisted chat history
- Keycloak JWT-protected `/api/chat` endpoint
- Rate limiting: 10 req/min per user

### Multi-Agent Documentation
- `server/AGENTS.md` — Claude agent architecture, Tool Use patterns, decision log schema
- `server/GEMINI.md` — Gemini integration spec, multi-model fallback strategy

### Async AI Jobs — Trigger.dev

| Trigger File | Purpose |
|---|---|
| `trigger/chat-async.ts` | Offloads Claude completions to background queue — prevents HTTP timeouts |
| `trigger/daily-report.ts` | Scheduled AI-generated business intelligence report (orders, stock, trends) |
| `trigger/low-stock-alert.ts` | Reacts to Prometheus stock events → autonomous Claude reorder pipeline |
| `trigger/order-confirmation.ts` | Event-driven order processing, inventory update, confirmation dispatch |

### Phase 2: Autonomous Stock Management Agent

```
Prometheus detects: seiko_stock_level{product="SKX007"} < 5
         │
         ▼
Grafana Webhook → POST /api/agent/stock-alert
         │
         ▼
Claude Tool Use executes:
  ├── query_db(product_id)        → fetch sales history
  ├── calculate_reorder(trend)    → compute optimal quantity
  ├── notify_supplier(quantity)   → send order request
  └── log_decision(action, db)    → persist agent decision
         │
         ▼
Grafana Annotation: "AI Decision: 50 units ordered @ 14:32"
```

**No human intervention required.**

### RAG Pipeline (pgvector)

```
User: "Do you have waterproof watches under €200?"
         │
         ▼
Embedding → pgvector similarity search (PostgreSQL)
         │
         ▼
Top-k product chunks → injected into Claude context
         │
         ▼
Grounded, accurate product recommendation
```

---

## 🔀 Event-Driven Integration Platform

> **Status: 🔄 Active — Go microservice and Kafka producer live as of v3.0**

The platform now includes a fully operational event-driven layer built with Redpanda (Kafka-compatible) and a Go integration microservice.

### Architecture

```
PERN Backend (order placed)
         │
         ▼  Kafka producer (server/kafka/producer.ts)
    Redpanda Topic: order.placed
         │
         ▼  Go consumer (integration-service/consumer/consumer.go)
  integration-service
         │
         ├── ServiceNow Adapter  → creates incident / change ticket
         └── [future adapters]  → Stripe, CRM, ERP
```

### Integration Service (`integration-service/`)

| File | Purpose |
|---|---|
| `main.go` | Service entrypoint, HTTP server, health check |
| `consumer/consumer.go` | Kafka consumer — reads `order.placed` events |
| `adapters/servicenow.go` | ServiceNow adapter — maps order events to ITSM tickets |
| `go.mod` / `go.sum` | Go module dependencies |
| `Dockerfile` | Multi-stage container build |

### Kafka Producer (Node.js)

| File | Purpose |
|---|---|
| `server/kafka/producer.ts` | Publishes `order.placed` events to Redpanda |
| `server/kafka/index.ts` | Kafka client initialization and connection management |

### Adapter Pattern

```go
type Adapter interface {
    Handle(event OrderEvent) error
}

// Implemented:
ServiceNowAdapter  → POST to ServiceNow API (mock)

// Planned:
StripeAdapter      → sync payment events
CRMAdapter         → update customer records
```

---

## 🏛️ Infrastructure as Code

Terraform modules written from scratch — production-ready, modular, and reviewable. Three cloud providers, zero vendor lock-in.

### AWS Terraform Modules (`infra/aws/modules/`)

| Module | Resources |
|---|---|
| `vpc/` | VPC, public/private subnets, route tables, NACLs |
| `alb/` | Application Load Balancer, target groups, ACM TLS |
| `ecs/` | ECS Fargate cluster, task definitions, service, autoscaling |
| `rds/` | PostgreSQL 15 RDS, parameter groups, KMS encryption |
| `secrets/` | AWS Secrets Manager, IAM policies, auto-rotation |
| `cloudwatch/` | Log groups, metric alarms, SNS alerts, dashboards |
| `ecr/` | Container registry, lifecycle policies, image scanning |

> AWS RDS connection config active — `server/config/aws-rds.js`

### GCP Terraform Modules (`infra/gcp/modules/`) — **Active as of v3.1**

| Module | Resources |
|---|---|
| `cloud_run/` | Cloud Run service, IAM bindings, traffic splitting, env vars |
| `cloud_sql/` | PostgreSQL (Cloud SQL), private IP, automated backups |
| `artifact_registry/` | Container registry, lifecycle policies |

> Root `infra/gcp/main.tf` wires all modules together with outputs for service URL, DB connection string, and registry URL.

### Tri-Cloud Strategy

| Layer | AWS | Azure | GCP |
|---|---|---|---|
| Container Runtime | ECS Fargate / EKS | Container Apps / AKS | Cloud Run / GKE |
| Database | RDS PostgreSQL | Azure Database for PostgreSQL | Cloud SQL PostgreSQL |
| CDN | CloudFront | Azure Front Door | Cloud CDN |
| Secrets | Secrets Manager | Key Vault | Secret Manager |
| Monitoring | CloudWatch | Azure Monitor | Cloud Monitoring |
| Container Registry | ECR | ACR | Artifact Registry |
| IaC | Terraform | Terraform / Bicep | Terraform |

---

## 🔐 Security

Security is enforced at every layer. OWASP Top 10 aligned.

### Frontend
| Measure | Implementation |
|---|---|
| XSS Prevention | DOMPurify on all dynamic content |
| Token Storage | HttpOnly + Secure + SameSite=Strict cookies — no localStorage |
| Content Policy | CSP headers block inline scripts and unauthorized sources |
| Route Guards | UX only — backend always enforces authorization |
| Subresource Integrity | SRI on external CDN scripts |

### Backend
| Measure | Implementation |
|---|---|
| Authentication | Keycloak JWKS-based JWT verification |
| Authorization | RBAC — Admin / User / Agent roles |
| Input Validation | Zod schema validation on all endpoints |
| SQL Injection | Parameterized queries throughout |
| Security Headers | Helmet.js — X-Frame-Options, HSTS, CSP |
| Rate Limiting | express-rate-limit per user and per IP |
| CORS | Strict origin whitelist — no wildcard in production |

### Infrastructure
| Measure | Implementation |
|---|---|
| Local HTTPS | mkcert self-signed certificates |
| Production TLS | Let's Encrypt via ACM / Azure |
| Secrets | Environment variables only — never hardcoded |
| IAM | Least-privilege policies on all AWS resources |
| Dependency Audit | npm audit + Snyk in CI pipeline |
| Container Isolation | Separate networks per service (Podman) |

---

## 📊 Observability

> Production systems must be measurable. This project has full observability coverage.

```
Metrics    → Prometheus + Grafana    (API latency, error rate, stock levels, Claude token usage)
Logs       → Loki + Promtail         (structured JSON, Kubernetes-native, agent decision audit)
Analytics  → ELK Stack               (full-text search, business intelligence, Kibana dashboards)
Enterprise → Splunk                  (SPL queries, security event correlation)
Tracing    → Jaeger                  (distributed tracing — Phase 5, microservices)
```

### Key Dashboards (Grafana)
- **API Health** — response time, error rate, throughput per endpoint
- **Stock Intelligence** — real-time levels, reorder threshold alerts
- **AI Operations** — Claude token usage, agent decision log, response latency
- **Infrastructure** — container CPU/memory, PostgreSQL connections, Keycloak auth events
- **Business Analytics** — (Kibana) order volume, product views, conversion funnel
- **Integration Platform** — Kafka consumer lag, adapter success/failure rates

---

## 🗺️ Roadmap

| Phase | Focus | Status |
|---|---|---|
| **v0.9 – v1.1** | Core app · Auth · Stripe · TypeScript migration · 78 tests · OpenAPI · CI/CD · Prometheus/Grafana · k6 | ✅ Done |
| **v2.0** | Azure production (Bicep IaC · Container Apps · PostgreSQL Flexible · OIDC) | ✅ Done |
| **v2.1** | Trigger.dev background jobs · Async Ollama chat · Resend transactional email | ✅ Done |
| **v3.0 — Event-Driven Integration Platform** | Redpanda (Kafka) · Go integration microservice · Adapter pattern · ServiceNow mock | 🔄 In Progress |
| **v3.1 — Resilience Layer** | Retry + exponential backoff · Circuit breaker (gobreaker) · Idempotency keys · Dead letter queue | 📋 Planned |
| **v3.2 — Integration Observability** | `integration_processed_total` · `integration_failed_total` · Grafana integration dashboard · Error rate alerts | 📋 Planned |
| **v3.3 — Chaos Engineering** | Mock ServiceNow failure · Kafka broker stop · Network delay simulation · Recovery testing | 📋 Planned |
| **v3.4 — AI Log Analyzer** | Trigger.dev task: collect failure logs → Claude analysis → Jira issue → suggested fix | 📋 Planned |
| **v4.0 — Multi-Cloud Kafka** | AWS MSK (Terraform) · Azure EventHub · Failover simulation · DB switch strategy | 📋 Planned |
| **v4.1 — SRE Layer** | SLO definition · Error budget tracking · Alert escalation · Integration health endpoints | 📋 Planned |
| **v4.2 — Integration CI Tests** | Spin up compose in GHA · Produce Kafka event · Assert DB consumption · Fail on timeout | 📋 Planned |
| **v5.0 — Kubernetes** | EKS/AKS · Helm charts · GitOps (ArgoCD) · Jaeger distributed tracing | 📋 Planned |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Go 1.21+
- Podman + podman-compose (or Docker + docker-compose)
- Git

### 1. Clone

```bash
git clone https://github.com/fatihkayas/pern-todo.git
cd pern-todo
```

### 2. Install Dependencies

```bash
npm install                                        # root (playwright, husky, commitlint)
cd server && npm install                           # backend
cd ../client && npm install --legacy-peer-deps     # frontend
cd ..
```

### 3. Configure Environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env` — minimum required:

```env
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5433
DB_DATABASE=jwtauth
JWT_SECRET=your_jwt_secret_here
ANTHROPIC_API_KEY=your_key_here      # for AI chatbot
KAFKA_BROKER=localhost:29092
```

### 4. Start

**Option A — Everything in containers (simplest):**

```bash
podman machine start        # once after reboot (Windows/macOS)
podman-compose up -d        # starts all 13 services
```

**Option B — Hybrid dev mode (hot reload for backend + frontend):**

```bash
podman machine start        # once after reboot
npm run dev                 # starts infra containers + backend + frontend in parallel
```

`npm run dev` automatically:
- Starts infrastructure containers (DB, Redpanda, Prometheus, Grafana, Alertmanager, Adminer, Ollama)
- Runs Express backend with `ts-node-dev` (hot reload) at <http://localhost:5001>
- Runs React frontend with CRA dev server (hot reload) at <http://localhost:3000>
- Starts Trigger.dev worker for background jobs

**Optional — Go integration service (separate terminal):**

```bash
cd integration-service && go run main.go
```

### 5. Verify

| Service | URL | Expected |
| --- | --- | --- |
| Frontend | <http://localhost:3000> | React app loads |
| Backend health | <http://localhost:5001/health> | `{"status":"ok"}` |
| Backend ready | <http://localhost:5001/ready> | `{"status":"ready"}` |
| Integration service | <http://localhost:8083/health> | `{"status":"ok"}` |
| Prometheus | <http://localhost:9090> | Targets page — 3/3 up |
| Grafana | <http://localhost:3001> | admin / admin |
| Redpanda Console | <http://localhost:8084> | Kafka topics |
| Adminer (DB) | <http://localhost:8082> | DB admin UI |

```bash
# Quick health check
curl http://localhost:5001/health    # → {"status":"ok"}
curl http://localhost:8083/health    # → {"status":"ok"}
```

### Database Migrations

```bash
cd server
npx node-pg-migrate up
```

---

## 📁 Project Structure

```
pern-todo/
├── client/                  # React 18 + TypeScript frontend
│   └── src/
│       ├── components/      # UI components + ChatWidget
│       ├── hooks/           # Custom React hooks
│       └── context/         # Auth, Cart context
├── server/                  # Express backend
│   ├── routes/              # API route handlers (TypeScript)
│   ├── middleware/          # Auth, validation, rate limit
│   ├── db/                  # PostgreSQL pool + queries
│   ├── agent/               # Claude Tool-Use agent logic
│   ├── kafka/               # Kafka producer (order events)
│   │   ├── index.ts         # Client initialization
│   │   └── producer.ts      # order.placed publisher
│   ├── config/
│   │   └── aws-rds.js       # AWS RDS connection config
│   ├── trigger/             # Async jobs (chat, report, stock, orders)
│   ├── AGENTS.md            # Claude agent architecture docs
│   └── GEMINI.md            # Gemini integration spec
├── integration-service/     # Go microservice (Kafka → adapters)
│   ├── main.go              # Entrypoint + HTTP server
│   ├── consumer/
│   │   └── consumer.go      # Kafka consumer
│   ├── adapters/
│   │   └── servicenow.go    # ServiceNow adapter
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── infra/
│   ├── aws/                 # Terraform AWS modules
│   │   └── modules/
│   │       ├── vpc/
│   │       ├── alb/
│   │       ├── ecs/
│   │       ├── rds/
│   │       ├── secrets/
│   │       ├── cloudwatch/
│   │       └── ecr/
│   └── gcp/                 # Terraform GCP modules (new in v3.1)
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── modules/
│           ├── cloud_run/
│           ├── cloud_sql/
│           └── artifact_registry/
├── monitoring/              # Prometheus config + Grafana dashboards
├── k8s/                     # Kubernetes manifests (Phase 5)
├── .github/workflows/       # GitHub Actions CI/CD (updated v3.1)
├── podman-compose.yml       # Local container orchestration
└── .env.example             # Environment template
```

---

## 🛠️ Core Technologies

**Frontend** — React 18 · TypeScript · Tailwind CSS · DOMPurify · react-hot-toast · dnd-kit

**Backend** — Node.js 20 · Express · TypeScript · Zod · Helmet.js · Morgan · express-rate-limit · Trigger.dev · node-pg-migrate

**Integration Service** — Go 1.21 · Kafka consumer · Adapter pattern · ServiceNow mock

**Database** — PostgreSQL 15 · pgvector · pg.Pool · AWS RDS

**Auth** — Keycloak · OpenID Connect · JWKS · RBAC

**AI** — Claude API (Anthropic) · Tool Use · RAG · pgvector embeddings · Async Trigger jobs · Multi-agent (AGENTS.md + GEMINI.md)

**Messaging** — Redpanda (Kafka-compatible) · order.placed events · consumer groups

**Observability** — Prometheus · Grafana · Loki · Promtail · Elasticsearch · Logstash · Kibana · Splunk · Jaeger

**DevOps** — Podman · Nginx · GitHub Actions · Snyk · Trivy

**Cloud** — AWS (ECS · EKS · RDS · ALB · CloudFront · ACM · Secrets Manager · CloudWatch · ECR) · Azure (Container Apps · AKS · PostgreSQL · Front Door · Key Vault · ACR) · **GCP (Cloud Run · Cloud SQL · Artifact Registry)**

**IaC** — Terraform (modular, tri-cloud) · AWS CDK · Bicep

**Kubernetes** — Minikube · Helm · ArgoCD · OpenShift

---

## 👤 For Recruiters & Engineering Teams

> **5 things this project demonstrates beyond the code:**

1. **Production thinking from day one** — security hardening, observability, error handling, and containerization are not afterthoughts. They are built into the architecture from the start.

2. **AI integration with real operational impact** — Claude is a server-side agent with Tool Use, database access, async Trigger.dev jobs, and autonomous decision-making. Multi-model strategy documented in AGENTS.md and GEMINI.md.

3. **Event-driven architecture in practice** — Kafka producer in TypeScript, Go consumer, ServiceNow adapter — not a demo, these are running services in the compose stack.

4. **Tri-cloud IaC with modular Terraform** — AWS (ECS, RDS, ALB), Azure (Container Apps), and GCP (Cloud Run, Cloud SQL, Artifact Registry) — all written as reusable Terraform modules. Same application, three providers, zero vendor lock-in.

5. **Continuous engineering discipline** — CI pipeline rebuilt in v3.1 (218-line diff), test coverage actively growing, every commit traceable to a phase and release version.

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Fatih Kayas** · Cloud & DevOps Engineer (in progress) · Germany

*Security-first · Observable · AI-native · Event-driven · Tri-cloud*

</div>