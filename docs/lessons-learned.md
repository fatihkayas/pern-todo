# Lessons Learned — Operational Knowledge

> Real problems encountered and solved during development.
> Updated after each release. Use this as a runbook for future deploys.

---

## GCP Cloud Run (v3.3.0)

### ❌ Container failed to start — PORT=8080
**Symptom:** `The user-provided container failed to start and listen on PORT=8080`
**Root cause:** Dockerfile CMD ran `db:migrate` before `node dist/index.js`. Migration tried to connect to DB during cold start — Cloud Run killed it after timeout.
**Fix:** Remove `db:migrate` from Dockerfile CMD. Migrations must be run separately via Cloud SQL Auth Proxy.
```dockerfile
# ❌ Wrong
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node dist/index.js"]
# ✅ Correct
CMD ["node", "dist/index.js"]
```

### ❌ Workload Identity Pool 409 — already exists
**Symptom:** `Error 409: Requested entity already exists` during terraform apply
**Root cause:** Deleted WIF pools are soft-deleted for 30 days — same ID cannot be reused.
**Fix:** Use a new pool ID (e.g. `v2` → `v3`) in `infra/gcp/main.tf`.

### ❌ Cloud SQL instance 409 — already exists
**Symptom:** `Error 409: The Cloud SQL instance already exists`
**Root cause:** Instance existed in GCP but not in Terraform state (previous partial apply).
**Fix:** Import the existing resource into state:
```bash
terraform import module.cloud_sql.google_sql_database_instance.postgres \
  pern-full-stack-489210/seiko-postgres
```

### ❌ CORS error — Backend unreachable
**Symptom:** `No 'Access-Control-Allow-Origin' header` in browser console
**Root cause:** GCP has separate URLs for frontend and backend (unlike AWS ALB same-origin). `window.location.origin` fallback pointed to frontend URL, not backend.
**Fix 1:** Rebuild frontend image with correct `REACT_APP_API_URL` build arg.
**Fix 2:** Set `CORS_ORIGIN` env var on Cloud Run backend:
```bash
gcloud run services update seiko-backend \
  --set-env-vars="^|^CORS_ORIGIN=https://seiko-frontend-xxx.run.app"
```
**Warning:** `--set-env-vars` replaces ALL env vars. Always use `--set-secrets` alongside to restore secrets, or you'll break the service.

### ❌ `--set-env-vars` killed all existing env vars
**Symptom:** New revision fails to start after `gcloud run services update --set-env-vars`
**Root cause:** `--set-env-vars` replaces everything, removing DB_HOST, JWT_SECRET, etc.
**Fix:** Always combine with `--set-secrets` to restore secrets:
```bash
gcloud run services update seiko-backend \
  --set-env-vars="^|^NODE_ENV=production|DB_HOST=..." \
  --set-secrets="DB_PASSWORD=seiko-db-password:latest,JWT_SECRET=seiko-jwt-secret:latest"
```

### ❌ password_hash column missing
**Symptom:** `column "password_hash" of relation "customers" does not exist`
**Root cause:** Initial migration `20260218054506-create-ecommerce-tables.js` didn't include `password_hash`.
**Fix:** Added column to migration + created a separate addColumn migration for existing databases. Also ran `ALTER TABLE customers ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)` directly on Cloud SQL via proxy.

### ❌ Stripe API key invalid
**Symptom:** `Invalid API Key provided: sk_test_***0000`
**Root cause:** `terraform.tfvars` used placeholder Stripe key `sk_test_fakekeyfortestingonly00000000`. Secret Manager was populated with this fake key.
**Fix:** Update Secret Manager with real key and force new Cloud Run revision:
```bash
echo -n "sk_test_real..." | gcloud secrets versions add seiko-stripe-secret-key --data-file=-
gcloud run services update seiko-backend --set-secrets="STRIPE_SECRET_KEY=seiko-stripe-secret-key:latest,..."
```

---

## AWS ECS Fargate (v3.2.0)

### ❌ RDS not publicly accessible for migrations
**Symptom:** Cannot connect to RDS from local machine to run migrations
**Fix:** Temporarily set `publicly_accessible = true` and add security group ingress rule for local IP. Remove after migrations complete.

### ❌ Google Drive image URLs broken
**Symptom:** Watch images 404 in production
**Root cause:** Google Drive direct links require authentication.
**Fix:** Replace all seeder image URLs with Unsplash CDN links.

---

## Azure Container Apps (v2.0.0)

### ❌ Stripe webhook secret is placeholder
**Note:** Stripe webhook secret in tfvars is placeholder. Update after creating real Stripe webhook endpoint pointing to the backend URL.

---

## Local Development (General)

### ❌ Port 5432 conflict on Windows
**Symptom:** DB container fails to start
**Root cause:** Windows PostgreSQL service runs on port 5432.
**Fix:** Map DB container to `5433:5432` in `podman-compose.yml`, use `DB_PORT=5433` in `.env`.

### ❌ Old .js files shadow .ts files in Jest
**Symptom:** Jest imports old JS version instead of new TS version
**Fix:** Always `git rm` old `.js` file when migrating to `.ts`.

### ❌ Frontend container port conflict
**Symptom:** `npm start` fails on port 3000
**Root cause:** Frontend container already using port 3000.
**Fix:** Stop the container first: `podman stop seiko_frontend`

### ❌ `git stash pop` fails with coverage files
**Symptom:** Stash pop conflict on `server/coverage/`
**Fix:** `git checkout -- server/coverage/` before `git stash pop`

---

## CI/CD (GitHub Actions)

### ❌ `--set-env-vars` with commas in value
**Symptom:** `Bad syntax for dict arg` when passing multiple values
**Fix:** Use `^|^` as delimiter:
```bash
--set-env-vars="^|^KEY1=val1|KEY2=val2,val3"
```

### ❌ Dockerfile migration on startup breaks CI deploy
**Symptom:** Cloud Run revision fails immediately after `gcloud run deploy`
**Root cause:** `db:migrate` in CMD fails because DB env vars aren't available during startup health check window.
**Rule:** Never run migrations in container startup. Use a separate job or manual proxy connection.
