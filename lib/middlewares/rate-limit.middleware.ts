/**
 * @fileoverview Rate limiting middleware using Upstash Redis
 */

import { queue } from "../cache";
import { ApiErrors, ApiError } from "./error.middleware";
import { getClientIp } from "./logging.middleware";
import type { AuthUser } from "./auth.middleware";

export interface RateLimitConfig {
  max: number; // Maximum requests
  window: string; // Time window: '1s', '1m', '1h', '1d'
  message?: string; // Custom error message
  keyPrefix?: string; // Custom key prefix
}

/**
 * Parse time window string to seconds
 */
function parseWindow(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);

  if (!match) {
    throw new Error(`Invalid window format: ${window}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value;
    case "m":
      return value * 60;
    case "h":
      return value * 60 * 60;
    case "d":
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid window unit: ${unit}`);
  }
}

/**
 * Generate rate limit key
 */
function getRateLimitKey(req: Request, user: AuthUser | null, config: RateLimitConfig): string {
  const prefix = config.keyPrefix || "ratelimit";
  const identifier = user ? `user:${user.id}` : `ip:${getClientIp(req)}`;
  const url = new URL(req.url);
  const endpoint = url.pathname;

  return `${prefix}:${endpoint}:${identifier}`;
}

/**
 * Check rate limit
 */
export async function checkRateLimit(
  req: Request,
  user: AuthUser | null,
  config: RateLimitConfig
): Promise<void> {
  try {
    // Skip rate limiting for admins and editors to reduce Redis usage
    if (user && (user.role === "admin" || user.role === "editor")) {
      return;
    }

    const key = getRateLimitKey(req, user, config);
    const windowSeconds = parseWindow(config.window);

    const result = await queue.checkRateLimit(key, config.max, windowSeconds);

    if (!result.allowed) {
      throw ApiErrors.TooManyRequests(
        config.message ||
          `Rate limit exceeded. Try again after ${new Date(result.resetAt).toISOString()}`,
        result.resetAt
      );
    }

    // Log rate limit info
    console.log(`🚦 Rate limit check: ${result.remaining}/${config.max} remaining`);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("Rate Limit: Error checking rate limit:", error);
    // Don't block requests if rate limiting fails
  }
}

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (req: Request, user: AuthUser | null): Promise<void> => {
    await checkRateLimit(req, user, config);
  };
}

/**
 * Pre-configured rate limiters
 */
export const RateLimiters = {
  // Strict limits for auth endpoints
  auth: { max: 5, window: "15m" },

  // Moderate limits for mutations
  createThread: { max: 10, window: "1h" },
  createComment: { max: 30, window: "1h" },
  createReview: { max: 5, window: "1h" },

  // Loose limits for reads
  readThread: { max: 100, window: "1m" },
  readProduct: { max: 100, window: "1m" },
  search: { max: 50, window: "1m" },

  // Very strict for expensive operations
  upload: { max: 10, window: "1h" },
  bulkOperation: { max: 5, window: "1h" },
};
