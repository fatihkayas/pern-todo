# 🚀 PERN Todo App — Development Roadmap

> **Project:** Seiko Watch Store / Todo App (PERN Stack)
> **Started:** February 2026
> **Goal:** Production-ready full-stack app → Cloud deployment on AWS & Azure with Claude AI integration

---

## 📦 Current Stack

| Layer | Technology | Status |
|---|---|---|
| Frontend | React (Create React App) | ✅ Running |
| Backend | Node.js + Express | ✅ Running |
| Database | PostgreSQL 15 | ✅ Running |
| Auth | Keycloak (OIDC) | ✅ Running |
| Containers | Podman + podman-compose | ✅ Running |
| DB Admin | Adminer | ✅ Running |
| Version Control | Git + GitHub | ✅ Running |

### Running Services
```
seiko_db         → PostgreSQL        :5432
keycloak_server  → Keycloak Auth     :8080
seiko_backend    → Express REST API  :5000
seiko_adminer    → DB Admin UI       :8081
seiko_frontend   → React App         :3000
```

---

## 🗺️ Phases Overview

```
Phase 1 → App Development     (Feb – Mar 2026)
Phase 2 → CI/CD & DevOps      (Apr 2026)
Phase 3 → AWS Deployment      (May – Jun 2026)
Phase 4 → Azure Deployment    (Jul – Aug 2026)
Phase 5 → Claude AI (Advanced)(Sep 2026+)
```

---

## Phase 1 — App Development ⚙️

> **Focus:** Make the app production-ready with modern features

### 1.1 AI Chatbot (Claude API)
- [ ] Backend: `POST /api/chat` endpoint (Anthropic SDK)
- [ ] Keycloak JWT middleware to protect the route
- [ ] Rate limiting (10 req/min per user via `express-rate-limit`)
- [ ] Todo context injection into system prompt
- [ ] Frontend: floating `ChatWidget` component (bottom-right)
- [ ] Streaming responses (SSE / fetch streaming)
- [ ] Conversation history (last 20 messages sent per request)
- [ ] Chat history persisted in PostgreSQL

### 1.2 UI / UX Improvements
- [ ] Responsive design (Tailwind CSS)
- [ ] Dark mode support
- [ ] Loading skeletons
- [ ] Toast notifications (`react-hot-toast`)
- [ ] Drag & drop todo reordering (`dnd-kit`)

### 1.3 Backend Improvements
- [ ] Input validation (`Zod`)
- [ ] Global error handling middleware
- [ ] Request logging (`Morgan`)
- [ ] DB migrations (`node-pg-migrate`)
- [ ] Unit + integration tests (`Jest` + `Supertest`)
- [ ] API rate limiting (`express-rate-limit`)

### 1.4 Security
- [ ] HTTPS locally (`mkcert`)
- [ ] Proper CORS configuration
- [ ] Security headers (`Helmet.js`)
- [ ] Secrets via env variables (never hardcoded)
- [ ] SQL injection protection (parameterized queries — already partial)

---

## Phase 2 — CI/CD & DevOps 🔄

> **Focus:** Automate testing, building, and deployment

- [ ] GitHub Actions: test pipeline on every push
- [ ] GitHub Actions: Docker image build & push to GHCR
- [ ] ESLint + Prettier enforcement
- [ ] Dependency security scanning (`Snyk` or `Trivy`)
- [ ] Staging environment via Docker Compose
- [ ] Prometheus + Grafana metrics
- [ ] Centralized logging (Loki or ELK)
- [ ] Health check endpoints (`/health`, `/ready`)

---

## Phase 3 — AWS Deployment ☁️

> **Focus:** Run the app on AWS in a production environment

| Service | AWS Equivalent |
|---|---|
| Container Registry | Amazon ECR |
| Container Runtime | Amazon ECS (Fargate) |
| Database | Amazon RDS (PostgreSQL) |
| Load Balancer | Application Load Balancer |
| DNS + SSL | Route 53 + ACM |
| Secrets | AWS Secrets Manager |
| CDN (Frontend) | CloudFront |
| File Storage | S3 |

### Learning Topics
- IAM: users, roles, policies
- VPC: subnets, security groups, NAT gateway
- ECS Task Definitions & Services
- RDS Multi-AZ and automated backups
- CloudWatch alarms and dashboards
- Infrastructure as Code: AWS CDK or Terraform

---

## Phase 4 — Azure Deployment 🔷

> **Focus:** Multi-cloud strategy — deploy to Azure as well

| Service | Azure Equivalent |
|---|---|
| Container Registry | Azure Container Registry (ACR) |
| Container Runtime | Azure Container Apps / AKS |
| Database | Azure Database for PostgreSQL |
| Auth | Azure AD + Entra ID |
| Secrets | Azure Key Vault |
| CDN | Azure Front Door |
| Monitoring | Azure Monitor + App Insights |

### Learning Topics
- Azure Resource Manager & Resource Groups
- Azure DevOps (Pipelines, Boards, Repos)
- Managed Identity (secretless auth)
- AKS basics
- Bicep or Terraform for IaC

---

## Phase 5 — Claude AI (Advanced) 🤖

> **Focus:** Make the app AI-native

- [ ] Tool use / Function calling (Claude performs CRUD via chat)
- [ ] Natural language todo search
- [ ] Smart task suggestions based on history
- [ ] Weekly summary report (Claude + cron job)
- [ ] Multi-modal support (image upload via Claude Vision)

### Prompt Engineering Topics
- System prompt design best practices
- Few-shot prompting
- Chain-of-thought reasoning
- Tool/function calling patterns
- Context window management & token optimization
- Streaming and async response handling

---

## 🎓 Certifications Roadmap

| Certification | Provider | Priority |
|---|---|---|
| AWS Cloud Practitioner | AWS | High |
| AWS Solutions Architect Associate | AWS | High |
| Azure Fundamentals (AZ-900) | Microsoft | High |
| Azure Developer Associate (AZ-204) | Microsoft | Medium |

---

## 📚 Learning Priority Order

1. Modern React patterns (hooks, context, performance)
2. Node.js best practices & clean architecture
3. PostgreSQL — advanced queries, indexing, performance
4. Docker & container best practices
5. CI/CD pipeline design (GitHub Actions)
6. AWS core services (ECS, RDS, S3, CloudFront)
7. Azure core services (Container Apps, Azure DB)
8. Claude API — advanced features & tool use
9. Infrastructure as Code (Terraform)
10. Kubernetes basics (AKS / EKS)

---

## 📅 Timeline

| Period | Phase | Goal |
|---|---|---|
| Feb – Mar 2026 | Phase 1: App Dev | Chatbot, UI, tests, security |
| Apr 2026 | Phase 2: CI/CD | GitHub Actions, Docker registry, monitoring |
| May – Jun 2026 | Phase 3: AWS | ECS, RDS, CloudFront — production live |
| Jul – Aug 2026 | Phase 4: Azure | Container Apps, Azure DB — multi-cloud |
| Sep 2026+ | Phase 5: AI Native | Tool use, advanced Claude, AKS/EKS |

---

> 📝 This is a living document. Updated as each phase is completed.
> Last updated: February 2026
