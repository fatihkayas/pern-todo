<div align="center">

# ⌚ Watch Store
### AI-Native Cloud Commerce Platform — PERN Stack

[![CI](https://img.shields.io/github/actions/workflow/status/fatihkayas/pern-todo/ci.yml?label=CI&logo=github-actions&logoColor=white&style=flat-square)](https://github.com/fatihkayas/pern-todo)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![Docker](https://img.shields.io/badge/Podman-Ready-892CA0?style=flat-square&logo=podman&logoColor=white)](https://podman.io)
[![Claude AI](https://img.shields.io/badge/Claude-AI%20Agent-CC785C?style=flat-square&logo=anthropic&logoColor=white)](https://anthropic.com)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-Ready-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io)
[![AWS](https://img.shields.io/badge/AWS-Deployed-FF9900?style=flat-square&logo=amazonaws&logoColor=white)](https://aws.amazon.com)
[![Azure](https://img.shields.io/badge/Azure-Deployed-0078D4?style=flat-square&logo=microsoftazure&logoColor=white)](https://azure.microsoft.com)
[![GCP](https://img.shields.io/badge/GCP-Deployed-4285F4?style=flat-square&logo=googlecloud&logoColor=white)](https://cloud.google.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**A production-oriented, security-first, cloud-ready commerce platform** built with the PERN stack,  
evolving into a fully observable, AI-native, multi-cloud system with autonomous LLM agents.

[Architecture](#-architecture) · [AI Agent](#-ai-agent--llm-integration) · [Security](#-security) · [Observability](#-observability) · [Roadmap](#-roadmap) · [Setup](#-getting-started)

</div>

---

## 🎯 What This Project Actually Is

> This is not a CRUD demo. It is not a tutorial project.

This is an **engineering platform** that simulates the architecture of a real production system — built and evolved intentionally to demonstrate:

- **Security by design** — OWASP Top 10 coverage across frontend and backend
- **Observability-first** — Prometheus, Grafana, Loki, ELK, and Splunk integration
- **AI as an operational layer** — Claude LLM agent with Tool Use, RAG, and autonomous decision-making
- **Cloud portability** — AWS, Azure, and GCP deployments with no vendor lock-in
- **Container orchestration** — Kubernetes-ready, OpenShift-compatible

---

## 🏗️ Architecture

> 📐 **[Interactive Architecture Diagram →](https://fatihkayas.github.io/pern-todo/architecture.html)**

> 📋 **[Architecture Decision Records →](./docs/adr/)** — why Octopus *and* ArgoCD, why Kubernetes before OpenShift, why three clouds, why LangGraph for the stock agent.

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│   React SPA  ·  HttpOnly Cookies  ·  CSP  ·  DOMPurify (XSS)  │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────────┐
│                      API GATEWAY / NGINX                        │
│            Reverse Proxy  ·  SSL Termination  ·  Rate Limit     │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                     BACKEND — Express API                       │
│   Keycloak OIDC  ·  RBAC  ·  Zod Validation  ·  Helmet.js     │
│   Parameterized SQL  ·  Rate Limiting  ·  Morgan Logger         │
└──────────┬───────────────┬───────────────────┬──────────────────┘
           │               │                   │
┌──────────▼─────┐  ┌──────▼──────┐  ┌────────▼────────────────┐
│  PostgreSQL 15 │  │ Claude Agent│  │   Observability Stack    │
│  + pgvector    │  │  Tool Use   │  │  Prometheus · Grafana    │
│  RAG-ready     │  │  RAG / LLM  │  │  Loki · Jaeger           │
└────────────────┘  └─────────────┘  └─────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────────┐
│                    CLOUD / ORCHESTRATION                        │
│   AWS (ECS · EKS · RDS · CloudFront)                           │
│   Azure (Container Apps · AKS · PostgreSQL · Front Door)       │
│   Kubernetes · OpenShift · Terraform (IaC)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Running Services

| Service | Technology | Port |
|---|---|---|
| Frontend | React 18 | `3000` |
| Backend API | Node.js + Express | `5000` |
| Auth Server | Keycloak (OIDC) | `8080` |
| Database | PostgreSQL 15 + pgvector | `5432` |
| DB Admin | Adminer | `8081` |
| Metrics | Prometheus | `9090` |
| Dashboards | Grafana | `3001` |
| Log Aggregation | Loki | `3100` |
| Log Analytics | Kibana (ELK) | `5601` |

---

## 🤖 AI Agent & LLM Integration

This project uses **Claude (Anthropic)** not as a chatbot decoration — but as an **operational layer** with real system impact.

### Live: Secure RAG Chatbot (v0.9.0)
- Backend proxy pattern — API keys never exposed to client
- System prompt injection with live product context
- Conversation history (last 20 messages) per session
- PostgreSQL-persisted chat history
- JWT-protected `/api/v1/chat` endpoint
- Rate limiting: 10 req/min per user

### Live: AI Log Analyzer — Claude + Jira (v3.7.0)

```
Scheduled task (Trigger.dev cron) reads Pino structured logs
         │
         ▼
Claude claude-opus-4-6 performs root cause analysis
         │
         ▼
Jira REST API v3 → auto-creates issue with severity + summary
         │
         ▼
Grafana annotation logged — full audit trail
```

**Zero human triage for recurring log patterns.**

### Planned: Autonomous Stock Management Agent (Phase 12.3)

```
Prometheus: seiko_stock_level < 5 → webhook
         │
         ▼
LangGraph state graph (see ADR-0004):
  ├── MCP server tools: list_low_stock_watches, create_reorder_request
  ├── Human-approval branch  (reorder value > threshold)
  └── Retry/backoff branch   (supplier notification failure)
         │
         ▼
Decision log → PostgreSQL · Grafana annotation
```

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

### Planned: LLMOps (Phase 12.3)

| Feature | Description |
|---|---|
| Prompt versioning | System prompts managed in Git like code |
| Token cost monitoring | Claude spend as Prometheus metric |
| Agent observability | Tool-call spans via Jaeger + OpenTelemetry |
| Model fallback | Claude primary → Ollama on failure |

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
| Security Headers | Helmet.js — X-Frame-Options, HSTS, CSP, etc. |
| Rate Limiting | express-rate-limit per user and per IP |
| CORS | Strict origin whitelist — no wildcard in production |

### Infrastructure
| Measure | Implementation |
|---|---|
| Local HTTPS | mkcert self-signed certificates |
| Production TLS | Let's Encrypt via ACM / Azure |
| Secrets | Environment variables only — never hardcoded |
| Dependency Audit | npm audit + Trivy SCA + Semgrep SAST in CI pipeline |
| Container Isolation | Separate networks per service (Podman) |

---

## 📊 Observability

> Production systems must be measurable. This project has full observability coverage.

```
Metrics    → Prometheus + Grafana    (API latency, error rate, stock levels, Claude token usage)
Logs       → Loki + Promtail         (production)
Tracing    → Jaeger                  (agent + tool-call spans)

Exploratory / learning track (not production):
- ELK Stack — full-text search, BI dashboards
- Splunk — SPL queries, security event correlation
```

### Key Dashboards (Grafana)

- **API Health** — response time, error rate, throughput per endpoint
- **Stock Intelligence** — real-time levels, reorder threshold alerts
- **AI Operations** — Claude token usage, agent decision log, response latency
- **Infrastructure** — container CPU/memory, PostgreSQL connections, Keycloak auth events
- **Business Analytics** — (Kibana) order volume, product views, conversion funnel

### Alerting Rules

```yaml
# Example: Stock threshold alert triggers Claude agent
- alert: LowStockLevel
  expr: seiko_stock_level < 5
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "Stock critical — AI agent triggered"
```

---

## ☸️ Kubernetes & Cloud

### Container Orchestration Roadmap

```
Local        →  Minikube (Podman driver) — running today
AWS          →  EKS (Phase 5) — Helm charts, HPA, AWS LBC
Azure        →  AKS (Phase 5) — Azure Monitor, Managed Identity
Enterprise   →  OpenShift Sandbox — free, available now
GitOps       →  ArgoCD / Flux — Phase 6
```

### Multi-Cloud Strategy

| Layer | AWS | Azure | GCP |
|---|---|---|---|
| Container Runtime | ECS Fargate / EKS | Container Apps / AKS | Cloud Run / GKE |
| Database | RDS PostgreSQL | Azure Database for PostgreSQL | Cloud SQL |
| CDN | CloudFront | Azure Front Door | Cloud CDN |
| Secrets | Secrets Manager | Key Vault | Secret Manager |
| Monitoring | CloudWatch | Azure Monitor | Cloud Monitoring |
| Container Registry | ECR | ACR | Artifact Registry |
| IaC | Terraform | Bicep / Terraform | Terraform |

---

## 🗺️ Roadmap

This README is the snapshot. The full, versioned roadmap lives in
[ROADMAP.md](./ROADMAP.md).

**Current: v3.7.0** · Phases 1–6 released · Phase 7.1 (Container
Hardening) ✅ · Next: Phase 7.2 (GitLab CI/CD)

See also: [Architecture Decision Records](./docs/adr/).

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Podman + podman-compose (or Docker + docker-compose)
- Git

### 1. Clone

```bash
git clone https://github.com/fatihkayas/pern-todo.git
cd pern-todo
git checkout -b feature/local-setup
```

### 2. Configure Environment

```bash
cp .env.example .env
```

```env
# Database
DATABASE_URL=postgresql://postgres:changeme@seiko_db:5432/jwtauth
DB_USER=postgres
DB_PASSWORD=changeme
DB_HOST=seiko_db
DB_PORT=5432
DB_DATABASE=jwtauth

# Auth
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=seiko-realm
KEYCLOAK_AUDIENCE=seiko-backend-client

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# AI — server-side only, never expose to client
ANTHROPIC_API_KEY=your_key_here
```

> ⚠️ Never commit `.env`. Only `.env.example` is tracked in Git.

### 3. Start All Services

```bash
podman machine start
podman-compose up -d
podman ps                    # verify all containers running
podman-compose logs -f       # follow logs
```

### 4. Verify

```bash
# Health check
curl http://localhost:5000/health
# → {"ok":true}

# Protected endpoint — no token
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# → 401 Unauthorized ✓
```

### 5. Get Access Token (Local Testing)

```bash
# Get token from Keycloak
curl -X POST "http://localhost:8080/realms/seiko-realm/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=seiko-backend-client&username=USER&password=PASS"

# Use token
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"message":"hello"}'
# → 200 OK ✓
```

### Alternative: Local Development (no containers)

```bash
# Backend
cd server && npm install && npm run dev

# Frontend (separate terminal)
cd client && npm install && npm start
```

### Database Migrations

```bash
cd server
npx node-pg-migrate up

# Access DB directly
podman exec -it seiko_db psql -U postgres -d jwtauth
```

### Keycloak Setup

1. Open `http://localhost:8080`
2. Import `keycloak-realm.json` (if provided) or create realm manually
3. Create test user → assign role (`admin` / `user`)
4. Ensure **Direct Access Grants** enabled on client (for local token testing)

---

## 🧪 Testing & Quality

```bash
# Run tests
cd server && npm test
cd client && npm test

# Lint & format
npm run lint
npm run format
```

### CI Pipeline (GitHub Actions)

```
Push → Lint → Test → Semgrep SAST + Trivy SCA → Build Image → Trivy image scan → Push to GHCR
```

---

## 🔧 Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| DB connection refused | Container not running or wrong hostname | `podman ps` · check `DB_HOST=seiko_db` |
| JWKS not available | Keycloak not ready | Wait 30s after start · check `KEYCLOAK_BASE_URL` |
| 401 on all requests | Token expired or wrong audience | Re-fetch token · verify `KEYCLOAK_AUDIENCE` |
| CORS error | Mismatch on allowed origin | Check `FRONTEND_URL` in `.env` |
| Port conflict | Another service on same port | Change port in `.env` |

---

## 📁 Project Structure

```
pern-todo/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # UI components + ChatWidget
│   │   ├── hooks/           # Custom React hooks
│   │   └── context/         # Auth, Cart context
├── server/                  # Express backend
│   ├── routes/              # API route handlers
│   ├── middleware/           # Auth, validation, rate limit
│   ├── db/                  # PostgreSQL pool + queries
│   └── agent/               # Claude Tool-Use agent logic
├── monitoring/              # Prometheus config + Grafana dashboards
├── k8s/                     # Kubernetes manifests (Phase 5)
├── terraform/               # IaC — AWS + Azure (Phase 3–4)
├── .github/workflows/       # GitHub Actions CI/CD
├── podman-compose.yml        # Local container orchestration
└── .env.example             # Environment template
```

---

## 👤 For Recruiters & Engineering Teams

> **5 things this project demonstrates beyond the code:**

1. **Production thinking from day one** — security hardening, observability, error handling, and containerization are not afterthoughts. They are built into the architecture from the start.

2. **AI integration with real operational impact** — Claude is not a UI gimmick. It is a server-side agent with Tool Use, database access, and autonomous decision-making. This is LLMOps in practice.

3. **Multi-cloud without vendor lock-in** — AWS, Azure, and GCP deployments run the same containerized services unmodified. Cloud-specific concerns are isolated to the IaC layer only.

4. **Full observability stack** — Prometheus, Grafana, Loki, and Jaeger are production-configured. ELK and Splunk are included as an exploratory learning track. The system is measurable, alertable, and debuggable in production.

5. **Dual payment provider** — Stripe (Payment Intents + Webhook verification) and PayPal (Orders API v2, create + capture) are both live and tested. The backend returns 503 gracefully when PayPal credentials are absent — no hard dependency.

6. **Cloud-native trajectory** — The project is actively moving toward Kubernetes (EKS/AKS), GitOps (ArgoCD), and OpenShift. Every architectural decision is made with orchestration in mind.

---

## 🛠️ Core Technologies

**Frontend** — React 18 · Tailwind CSS · DOMPurify · react-hot-toast · dnd-kit

**Backend** — Node.js 20 · Express · Zod · Helmet.js · Morgan · express-rate-limit · node-pg-migrate

**Database** — PostgreSQL 15 · pgvector · pg.Pool

**Auth** — Keycloak · OpenID Connect · JWKS · RBAC

**Payments** — Stripe (Payment Intents + Webhooks) · PayPal (Orders API v2 — create + capture, graceful no-op if unconfigured)

**AI** — Claude API (Anthropic) · Tool Use · RAG · pgvector embeddings

**Observability (production)** — Prometheus · Grafana · Loki · Promtail · Jaeger

**Observability (exploratory)** — Elasticsearch · Logstash · Kibana · Splunk

**DevOps** — Podman · Nginx · GitHub Actions · GitLab CI · Semgrep · Trivy

**Cloud** — AWS (ECS · EKS · RDS · CloudFront · ACM · Secrets Manager) · Azure (Container Apps · AKS · PostgreSQL · Front Door · Key Vault)

**IaC** — Terraform · AWS CDK · Bicep

**Kubernetes** — Minikube · Helm · ArgoCD · OpenShift

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

**Fatih Kayas** · Cloud & DevOps Engineer (in progress) · Germany

*Security-first · Observable · AI-native · Cloud-portable*

</div>
