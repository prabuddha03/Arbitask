/**
 * @fileoverview Request/Response logging middleware
 *
 * Uses existing logger from lib/utils/logger.ts
 */

import { logInfo, logError } from "../utils/logger";
import { getOrCreateRequestId } from "./request-id.middleware";

export interface LogContext {
  requestId: string;
  method: string;
  pathname: string;
  startTime: number;
  ip?: string;
  userAgent?: string;
  userId?: string;
}

/**
 * Extract client IP from request
 */
export function getClientIp(req: Request): string {
  // Check common headers for IP (reverse proxy, CDN, etc.)
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const cfConnectingIp = req.headers.get("cf-connecting-ip");

  if (cfConnectingIp) return cfConnectingIp;
  if (realIp) return realIp;
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  return "unknown";
}

/**
 * Create log context from request
 */
export function createLogContext(req: Request): LogContext {
  const url = new URL(req.url);

  return {
    requestId: getOrCreateRequestId(req),
    method: req.method,
    pathname: url.pathname,
    startTime: Date.now(),
    ip: getClientIp(req),
    userAgent: req.headers.get("user-agent") || undefined,
  };
}

/**
 * Log incoming request
 */
export function logRequest(context: LogContext): void {
  logInfo(
    {
      method: context.method,
      pathname: context.pathname,
    },
    {
      requestId: context.requestId,
      ip: context.ip,
      userAgent: context.userAgent,
    }
  );
}

/**
 * Log successful response
 */
export function logResponse(context: LogContext, statusCode: number): void {
  const duration = Date.now() - context.startTime;

  logInfo(
    {
      method: context.method,
      pathname: context.pathname,
    },
    {
      requestId: context.requestId,
      status: statusCode,
      duration,
      userId: context.userId,
    }
  );
}

/**
 * Log error response
 */
export function logErrorResponse(context: LogContext, error: Error, statusCode: number): void {
  const duration = Date.now() - context.startTime;

  logError(
    {
      method: context.method,
      pathname: context.pathname,
    },
    {
      requestId: context.requestId,
      status: statusCode,
      duration,
      error: error.message,
      stack: error.stack,
    }
  );
}

/**
 * Sanitize headers for logging (remove sensitive data)
 */
export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

  headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = "***REDACTED***";
    } else {
      sanitized[key] = value;
    }
  });

  return sanitized;
}
