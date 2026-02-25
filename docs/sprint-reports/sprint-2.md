# Phase 2 — Sprint 2 Report

**Sprint:** Phase 2, Sprint 2
**Branch:** `main`
**Status:** Complete ✅

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

### SCRUM-18 — Frontend TypeScript Migration

**Date:** 2026-02-25

#### What was done
- Installed TypeScript + type packages in `client/`:
  - `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
  - `@types/jest`, `@testing-library/dom` (for type-check support)
- Created `client/tsconfig.json` (strict mode, `react-jsx`, `esnext` module)
- Created `client/src/types.ts` — shared interfaces:
  - `Watch`, `CartItem`, `Customer`, `OrderStatus`, `OrderItem`, `Order`, `AdminStats`
- Migrated all 21 source files from `.js` → `.tsx`/`.ts`:
  - `src/index.tsx`, `src/App.tsx`, `src/App.test.tsx`
  - `src/reportWebVitals.ts`, `src/keycloak.ts`, `src/setupTests.ts`
  - `src/context/ThemeContext.tsx`
  - `src/components/Navbar.tsx`, `CartSidebar.tsx`, `ChatWidget.tsx`
  - `src/pages/About.tsx`, `Contact.tsx`, `Help.tsx`, `Returns.tsx`
  - `src/pages/Store.tsx`, `ProductDetail.tsx`
  - `src/pages/Login.tsx`, `Register.tsx`
  - `src/pages/MyOrders.tsx`, `AdminPanel.tsx`, `Checkout.tsx`
- Removed all 21 old `.js` source files via `git rm`
- `npx tsc --noEmit` → 0 errors
- `npm run build` → Compiled successfully (116.86 kB gzipped)

#### Key typing decisions
| Decision | Reason |
|----------|--------|
| `price: string` in `Watch` | PostgreSQL DECIMAL returns as string; use `Number(item.price)` for math |
| `customer_id: number \| null` in `Order` | Anonymous checkout supported |
| `(e.target as HTMLImageElement).src` | onError handler needs cast |
| `keycloak.ts` excluded from tsconfig | Uses ESM exports field incompatible with `moduleResolution: node` |
| `fetch("/api/v1/watches")` | Updated from `/api/watches` to match API versioning |

#### Files changed
| File | Change |
|------|--------|
| `client/tsconfig.json` | New |
| `client/src/types.ts` | New — shared TypeScript interfaces |
| `client/src/*.tsx` / `*.ts` | 21 files migrated (old `.js` removed) |
| `client/package.json` | Added TypeScript + `@types` dev dependencies |

#### Build result
```
Compiled successfully.
116.86 kB (+9.15 kB)  build/static/js/main.efd60a7c.js
```

---

## Sprint 2 — Complete ✅

All tasks completed:

| Task | Ticket | Status |
|------|--------|--------|
| Jest + ESLint + Prettier + Husky | SCRUM-15 | ✅ Done |
| OpenAPI Docs + API Versioning | SCRUM-16 | ✅ Done |
| Postman Collection | SCRUM-17 | ✅ Done |
| Frontend TypeScript Migration | SCRUM-18 | ✅ Done |
