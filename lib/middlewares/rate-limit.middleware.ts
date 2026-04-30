/**
 * @fileoverview Rate limiting middleware
 *
 * Uses in-memory sliding window rate limiting (suitable for single-instance dev/staging).
 * For production multi-instance deployments, swap the store for Redis/Upstash.
 */

import { ApiErrors, ApiError } from "./error.middleware";
import { getClientIp } from "./logging.middleware";
import type { AuthUser } from "./auth.middleware";

export interface RateLimitConfig {
  max: number; // Maximum requests allowed
  window: string; // Time window: '1s', '1m', '1h', '1d'
  message?: string; // Custom error message
  keyPrefix?: string; // Custom key prefix
}

interface WindowEntry {
  count: number;
  resetAt: number; // Unix ms timestamp
}

// In-memory rate limit store (sliding window, per key)
const store = new Map<string, WindowEntry>();

/**
 * Parse time window string to milliseconds
 */
function parseWindowMs(window: string): number {
  const match = window.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid window format: ${window}`);

  const value = parseInt(match[1], 10);
  switch (match[2]) {
    case "s": return value * 1_000;
    case "m": return value * 60_000;
    case "h": return value * 3_600_000;
    case "d": return value * 86_400_000;
    default: throw new Error(`Invalid window unit: ${match[2]}`);
  }
}

/**
 * Generate a rate limit store key
 */
function getRateLimitKey(req: Request, user: AuthUser | null, config: RateLimitConfig): string {
  const prefix = config.keyPrefix ?? "ratelimit";
  const identifier = user ? `user:${user.id}` : `ip:${getClientIp(req)}`;
  const endpoint = new URL(req.url).pathname;
  return `${prefix}:${endpoint}:${identifier}`;
}

/**
 * Check and enforce rate limit for the request.
 * Does NOT throw if the rate limit store itself errors — silent fail to avoid blocking requests.
 */
export async function checkRateLimit(
  req: Request,
  user: AuthUser | null,
  config: RateLimitConfig
): Promise<void> {
  try {
    const key = getRateLimitKey(req, user, config);
    const windowMs = parseWindowMs(config.window);
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now >= entry.resetAt) {
      // New window
      store.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }

    if (entry.count >= config.max) {
      throw ApiErrors.TooManyRequests(
        config.message ?? `Rate limit exceeded. Retry after ${new Date(entry.resetAt).toISOString()}`,
        entry.resetAt
      );
    }

    entry.count += 1;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Swallow internal store errors — never block a request
    console.warn("[rate-limit] Store error (non-blocking):", error);
  }
}

/**
 * Wrap a handler with rate limiting
 */
export function withRateLimit(config: RateLimitConfig) {
  return async (req: Request, user: AuthUser | null): Promise<void> => {
    await checkRateLimit(req, user, config);
  };
}

/**
 * Pre-configured rate limiters for Arbitask endpoints
 */
export const RateLimiters = {
  // Auth endpoints — tight
  auth: { max: 5, window: "15m" } satisfies RateLimitConfig,

  // Mutation endpoints
  createProject: { max: 20, window: "1h" } satisfies RateLimitConfig,
  createTask: { max: 60, window: "1h" } satisfies RateLimitConfig,
  createNote: { max: 30, window: "1h" } satisfies RateLimitConfig,
  generateInvite: { max: 10, window: "1h" } satisfies RateLimitConfig,

  // Read endpoints — generous
  read: { max: 200, window: "1m" } satisfies RateLimitConfig,

  // Heavy/expensive operations
  upload: { max: 10, window: "1h" } satisfies RateLimitConfig,
};
