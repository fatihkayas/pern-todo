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

export { register };
