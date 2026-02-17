# 📓 Development Notes & Best Practices

> Running log of decisions, lessons learned, and best practices for the PERN Todo / Seiko Watch Store project.

---

## 🗂️ Table of Contents
- [Architecture Decisions](#architecture-decisions)
- [Best Practices — Backend](#best-practices--backend)
- [Best Practices — Frontend](#best-practices--frontend)
- [Best Practices — AI Chatbot](#best-practices--ai-chatbot)
- [Best Practices — Security](#best-practices--security)
- [Best Practices — Docker / Containers](#best-practices--docker--containers)
- [Lessons Learned](#lessons-learned)
- [Useful Commands](#useful-commands)

---

## Architecture Decisions

### ADR-001 — Keycloak for Authentication
**Date:** Feb 2026
**Decision:** Use Keycloak instead of custom JWT auth.
**Reason:** Keycloak provides OIDC out of the box, supports SSO, role-based access, and is cloud-portable. Custom JWT auth requires maintaining token refresh, revocation, and rotation manually.
**Trade-off:** Adds an extra service to run; heavier than simple JWT middleware for small apps.

### ADR-002 — Podman instead of Docker
**Date:** Feb 2026
**Decision:** Use Podman + podman-compose for local development.
**Reason:** Rootless containers by default (more secure), Docker-compatible API, no daemon required.
**Note:** `podman machine set --rootful` needed if ports < 1024 are required.

### ADR-003 — PostgreSQL via connection pool
**Date:** Feb 2026
**Decision:** Use `pg.Pool` instead of a single `pg.Client`.
**Reason:** Pool reuses connections across requests; a single client blocks on long queries and fails on connection drops.

### ADR-004 — Environment variables for all secrets
**Date:** Feb 2026
**Decision:** All DB credentials and passwords via `.env` — never hardcoded.
**Status:** ⚠️ `podman-compose.yml` currently has `your_password` hardcoded → must be moved to `.env` before production.

---

## Best Practices — Backend

### Express Setup
```js
// Always use cors before routes
app.use(cors());
app.use(express.json());

// Catch-all error handler (add this last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});
```

### PostgreSQL
- Always use parameterized queries — never string concatenation
```js
// ✅ CORRECT
pool.query("SELECT * FROM users WHERE id = $1", [userId]);

// ❌ WRONG — SQL injection risk
pool.query(`SELECT * FROM users WHERE id = ${userId}`);
```
- Always handle DB errors and return proper HTTP status codes
- Use `pool.query` for simple queries, transactions for multi-step operations

### Route Organization
- Keep routes in separate files (`/routes/users.js`, `/routes/watches.js`)
- Keep DB logic in service/model files — not directly in route handlers
- Validate all inputs before hitting the DB (use `Zod`)

### Error Handling
```js
// Wrap async route handlers
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/watches", asyncHandler(async (req, res) => {
  const result = await pool.query("SELECT * FROM watches");
  res.json(result.rows);
}));
```

---

## Best Practices — Frontend

### React
- Use functional components + hooks only (no class components)
- Keep components small and single-responsibility
- Extract API calls into a separate `api/` folder or custom hooks
- Never call `fetch` directly from JSX — use `useEffect` or a custom hook

### Keycloak Integration
```js
// keycloak.js — initialize once, import everywhere
import Keycloak from 'keycloak-js';
const keycloak = new Keycloak({ url, realm, clientId });
export default keycloak;
```
- Always check `keycloak.authenticated` before making protected API calls
- Pass the token in `Authorization: Bearer <token>` header

### API Calls
```js
// Always pass Keycloak token in requests
const res = await fetch('/api/todos', {
  headers: {
    'Authorization': `Bearer ${keycloak.token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Best Practices — AI Chatbot

> Decided: Claude API, floating widget, backend proxy pattern

### Architecture
```
User → React ChatWidget → POST /api/chat (backend)
                              ↓
                    Keycloak token verified
                              ↓
                    Todo list fetched from DB
                              ↓
                    Claude API called (server-side)
                              ↓
                    Streamed response back to frontend
```

### Key Rules
1. **API key stays on the server** — never in `.env` on the client or in frontend code
2. **Always send conversation history** — Claude has no memory between calls
3. **Limit history to last 20 messages** — balances context vs token cost
4. **Inject todo context in system prompt** — so Claude knows the user's tasks
5. **Use streaming** — responses feel instant, better UX
6. **Rate limit the endpoint** — prevent abuse and runaway costs
7. **Validate and sanitize input** — never pass raw user input directly

### System Prompt Template
```
You are a helpful assistant for a todo and watch store app.
The user's current todo list:
{{USER_TODOS}}

Answer questions about their tasks, help them prioritize, 
and assist with any general questions. Be concise.
```

### Token Cost Awareness
- `claude-sonnet` is cheaper than `claude-opus` for most chatbot tasks
- Set `max_tokens: 1024` for chat responses — enough for conversation
- Trim conversation history aggressively for long sessions

---

## Best Practices — Security

### Secrets
- [ ] Move all passwords from `podman-compose.yml` to `.env`
- [ ] Add `.env` to `.gitignore` (check it's there!)
- [ ] Use Docker secrets or AWS Secrets Manager in production

### Headers
```js
// Add Helmet.js for security headers
const helmet = require('helmet');
app.use(helmet());
```

### CORS
```js
// Restrict CORS to known origins in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

### Input Validation (Zod example)
```js
const { z } = require('zod');
const todoSchema = z.object({
  description: z.string().min(1).max(500)
});

app.post('/todos', async (req, res) => {
  const parsed = todoSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  // ... proceed safely
});
```

---

## Best Practices — Docker / Containers

### Podman Commands (Cheatsheet)
```bash
podman machine start              # Start Podman VM
podman-compose up -d              # Start all services (detached)
podman-compose down               # Stop all services
podman-compose logs -f backend    # Follow backend logs
podman ps                         # List running containers
podman exec -it seiko_db psql -U postgres -d jwtauth  # DB shell
```

### Dockerfile Tips
- Use specific image versions — not `latest` in production (e.g. `node:20-alpine`)
- Use multi-stage builds to keep images small
- Never copy `.env` into Docker image
- Add `.dockerignore`: `node_modules`, `.env`, `*.log`

### Health Checks
```yaml
# In podman-compose.yml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s
  timeout: 5s
  retries: 5
```

---

## Lessons Learned

| Date | Topic | Lesson |
|---|---|---|
| Feb 2026 | Podman | SSH port conflict on machine start is harmless — auto-reassigned |
| Feb 2026 | Keycloak | `start-dev` is for development only — use `start` in production |
| Feb 2026 | pg.Pool | Always use Pool not Client for Express apps |
| Feb 2026 | Chatbot | Never put AI API keys in frontend code |
| Feb 2026 | Docker | `podman machine set --rootful` needed for ports < 1024 |

---

## Useful Commands

```powershell
# Start everything
podman machine start
podman-compose up -d

# Check status
podman ps

# View logs
podman-compose logs -f

# Stop everything
podman-compose down

# Git workflow
git add .
git commit -m "feat: description"
git push origin main

# Build images locally
podman build -t localhost/seiko-backend:latest ./server
podman build -t localhost/seiko-frontend:latest ./client
```

---

> 📝 Add new lessons and decisions as you go. Small notes now = big time savings later.
> Last updated: February 2026
