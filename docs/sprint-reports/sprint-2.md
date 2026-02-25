# Phase 2 — Sprint 2 Report

**Sprint:** Phase 2, Sprint 2
**Branch:** `main`
**Status:** In Progress

---

## Completed Tasks

### SCRUM-15 — Code Quality (committed: `3f89ddd`)
- Jest + Supertest test suite (83 tests, 86% coverage)
- ESLint v8 + Prettier configured
- Husky pre-commit hooks (type-check + lint-staged)
- Commitlint (conventional commits enforced)

---

### SCRUM-16 — OpenAPI Documentation + API Versioning

**Date:** 2026-02-25

#### What was done
- Installed `swagger-jsdoc` + `swagger-ui-express` (+ `@types`)
- Created `server/swagger.ts` — OpenAPI 3.0 spec with:
  - 5 tag groups: Watches, Auth, Orders, Admin, Stripe
  - Reusable schemas: Watch, Order, Error
  - Bearer JWT security scheme
- Added `@swagger` JSDoc comments to all route files:
  - `app.ts` — GET /api/v1/watches
  - `routes/auth.ts` — POST /register, POST /login, GET /me
  - `routes/admin.ts` — GET /orders, PUT /orders/:id/status, GET /watches, PUT /watches/:id/stock, GET /stats
  - `routes/orders.ts` — POST /, GET /my, GET /:id
  - `routes/stripe.ts` — POST /create-payment-intent, POST /webhook, POST /confirm-order
- Swagger UI served at `/api-docs` (accessible via nginx at `https://localhost:8443/api-docs`)
- All API routes versioned under `/api/v1/` prefix
- All 78 Jest tests updated to use `/api/v1/` prefix — all passing

#### Files changed
| File | Change |
|------|--------|
| `server/swagger.ts` | New — swagger-jsdoc config |
| `server/app.ts` | Added swagger-ui-express + JSDoc |
| `server/routes/auth.ts` | Added JSDoc for all 3 endpoints |
| `server/routes/admin.ts` | Added JSDoc for all 5 endpoints |
| `server/routes/orders.ts` | Added JSDoc for all 3 endpoints |
| `server/routes/stripe.ts` | Added JSDoc for all 3 endpoints |
| `server/package.json` | Added swagger deps |
| `server/__tests__/*.test.ts` | Updated all paths to `/api/v1/` |

#### Test results
```
Test Suites: 6 passed, 6 total
Tests:       78 passed, 78 total
```

---

### SCRUM-17 — Postman Collection

**Date:** 2026-02-25

#### What was done
- Created `docs/postman/seiko-watch-store.postman_collection.json` — Postman v2.1 collection
  - 6 folders: Health, Watches, Auth, Orders, Admin, Stripe
  - 16 requests covering all documented endpoints
  - Login request auto-saves token to `{{token}}` via test script
  - All requests use `{{baseUrl}}`, `{{token}}`, `{{adminToken}}` variables
- Created `docs/postman/seiko-watch-store.postman_environment.json`
  - `baseUrl` = `https://localhost:8443`
  - `token`, `adminToken`, `orderId`, `watchId`, `stripeWebhookSig` variables

#### Files changed
| File | Change |
|------|--------|
| `docs/postman/seiko-watch-store.postman_collection.json` | New |
| `docs/postman/seiko-watch-store.postman_environment.json` | New |

---

## Remaining Tasks

| Task | Status |
|------|--------|
| Frontend `.tsx` migration | Pending |

---

## Next Up — Frontend TypeScript Migration

Files to migrate (19 total):
- `src/index.js` → `index.tsx`
- `src/App.js` → `App.tsx`
- `src/reportWebVitals.js` → `reportWebVitals.ts`
- `src/keycloak.js` → `keycloak.ts`
- `src/context/ThemeContext.js` → `ThemeContext.tsx`
- `src/components/Navbar.js` → `Navbar.tsx`
- `src/components/CartSidebar.js` → `CartSidebar.tsx`
- `src/components/ChatWidget.js` → `ChatWidget.tsx`
- `src/pages/About.js`, `Contact.js`, `Help.js`, `Returns.js` → `.tsx`
- `src/pages/Store.js` → `Store.tsx`
- `src/pages/ProductDetail.js` → `ProductDetail.tsx`
- `src/pages/Login.js`, `Register.js` → `.tsx`
- `src/pages/MyOrders.js` → `MyOrders.tsx`
- `src/pages/AdminPanel.js` → `AdminPanel.tsx`
- `src/pages/Checkout.js` → `Checkout.tsx`
