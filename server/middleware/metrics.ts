import { Request, Response, NextFunction } from "express";
import client from "prom-client";

// Default metrics (GC, event loop, memory, CPU)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP request counter
const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

// HTTP request duration histogram
const httpRequestDurationMs = new client.Histogram({
  name: "http_request_duration_ms",
  help: "HTTP request latency in milliseconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500],
  registers: [register],
});

export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    // Normalise dynamic segments: /api/v1/orders/42 → /api/v1/orders/:id
    const route = (req.route?.path as string | undefined)
      ? req.baseUrl + req.route.path
      : req.path.replace(/\/\d+/g, "/:id");

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationMs.observe(labels, duration);
  });

  next();
}

// --- Business metrics ---

// Orders
export const ordersCreatedTotal = new client.Counter({
  name: "orders_created_total",
  help: "Total number of orders successfully created",
  registers: [register],
});

export const ordersRevenueDollars = new client.Counter({
  name: "orders_revenue_dollars_total",
  help: "Cumulative revenue from created orders in dollars",
  registers: [register],
});

// Ollama chat
export const chatRequestsTotal = new client.Counter({
  name: "ollama_chat_requests_total",
  help: "Total number of Ollama chat requests",
  registers: [register],
});

export const chatDurationMs = new client.Histogram({
  name: "ollama_chat_duration_ms",
  help: "Ollama chat response duration in milliseconds",
  buckets: [100, 250, 500, 1000, 2500, 5000, 10000],
  registers: [register],
});

export { register };
