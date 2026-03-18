# Seiko Watch Store — Gemini CLI Context

This project is a production-oriented, AI-native multi-cloud commerce platform built with the PERN stack. It features a React frontend, Node.js Express backend, PostgreSQL database, and integrates with several advanced technologies like Kafka, Trigger.dev, and Claude AI agents.

## Project Overview

- **Architecture:** PERN Stack (PostgreSQL, Express, React, Node.js)
- **Frontend:** React 18, TypeScript, Tailwind CSS, React Router 7.
- **Backend:** Node.js 20, Express, TypeScript, Zod validation, Helmet security.
- **AI Integration:** Claude (Anthropic) for operational tasks and RAG. Trigger.dev for asynchronous background jobs.
- **Event-Driven:** Redpanda (Kafka-compatible) for event streaming.
- **Integration Service:** Go 1.21 microservice consuming Kafka events (e.g., `order.placed`) and integrating with external adapters (e.g., ServiceNow).
- **Infrastructure:** Multi-cloud IaC using Terraform (AWS, GCP) and Bicep (Azure).
- **Observability:** Prometheus & Grafana for metrics, Loki for logs, ELK/Splunk for analytics.
- **Authentication:** Keycloak (OIDC) with RBAC (Admin, User, Agent roles).

## Building and Running

### Prerequisites
- Node.js 20+
- Go 1.21+
- Podman/Docker with Compose support.

### Setup
1. **Install dependencies:**
   ```bash
   npm install              # Root
   cd server && npm install # Backend
   cd ../client && npm install --legacy-peer-deps # Frontend
   ```
2. **Environment Variables:**
   Copy `server/.env.example` to `server/.env` and configure accordingly.
3. **Database Migrations:**
   ```bash
   cd server
   npx node-pg-migrate up
   ```

### Running the Project
- **Development Mode (Full Stack):**
  ```bash
  npm run dev
  ```
  This starts infrastructure containers (DB, Redpanda, etc.), the Express server, the Trigger.dev worker, and the React frontend.
- **Backend Only:**
  ```bash
  cd server && npm run dev
  ```
- **Frontend Only:**
  ```bash
  cd client && npm start
  ```
- **Integration Service (Go):**
  ```bash
  cd integration-service && go run main.go
  ```

### Testing
- **E2E Tests:** `npm run test:e2e` (Playwright)
- **Backend Tests:** `cd server && npm test` (Jest)
- **Frontend Tests:** `cd client && npm test` (Jest/RTL)

## Development Conventions

- **TypeScript:** Strictly used across frontend and backend.
- **Validation:** Use **Zod** for all API request validation (see `server/schemas.ts`).
- **Security:** Follow OWASP Top 10. Use parameterized queries, Helmet.js, and rate limiting.
- **Auth:** Authentication is handled via Keycloak. Backend routes should use `authMiddleware`.
- **Async Tasks:** Use **Trigger.dev (v4)** for any long-running or background tasks. **NEVER use `client.defineJob` (v2).**
- **Events:** Publish important business events (e.g., `order.placed`) to Kafka.
- **Logging:** Use `pino` for structured logging.
- **API Documentation:** Swagger/OpenAPI is available at `/api-docs`.

## Trigger.dev Instructions (v4)

**MUST use `@trigger.dev/sdk`**.

### Basic Task Template
```ts
import { task } from "@trigger.dev/sdk";

export const myTask = task({
  id: "my-task-id",
  run: async (payload: { data: string }) => {
    // Task logic
    return { success: true };
  },
});
```

### Triggering and Waiting
```ts
// In backend or another task
const result = await myTask.triggerAndWait({ data: "value" });
if (result.ok) {
  console.log(result.output);
}
```

## Key Files
- `server/app.ts`: Express application entry and middleware.
- `server/db.ts`: PostgreSQL connection pool.
- `server/trigger/`: Trigger.dev task definitions.
- `client/src/App.tsx`: Main React application component.
- `infra/`: Terraform and Bicep infrastructure definitions.
- `integration-service/`: Go microservice for event processing.
