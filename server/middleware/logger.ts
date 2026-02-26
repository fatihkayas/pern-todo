import pino from "pino";
import pinoHttp from "pino-http";
import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

const isDev = process.env.NODE_ENV === "development";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
    },
  }),
});

// HTTP request logger — replaces morgan
export const httpLogger = pinoHttp({
  logger,
  // Attach correlation ID from request to each log line
  genReqId: (req) => (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID(),
  customLogLevel: (_req, res) => {
    if (res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  // Skip health/metrics polling noise in logs
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url === "/metrics",
  },
});

// Correlation ID middleware — injects or propagates x-correlation-id header
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const id = (req.headers["x-correlation-id"] as string | undefined) ?? randomUUID();
  req.headers["x-correlation-id"] = id;
  res.setHeader("x-correlation-id", id);
  next();
}
