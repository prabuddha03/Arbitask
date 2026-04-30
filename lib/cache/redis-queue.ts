import { Redis } from "@upstash/redis";

/**
 * @fileoverview Upstash Serverless Redis client for queues, auth, and durable operations
 *
 * Features:
 * - Serverless-friendly (REST API)
 * - Edge-compatible
 * - Durable storage for critical data
 * - Auto-retry with exponential backoff
 */

declare global {
  var redisQueue: (Redis & { __shutdownHandlersRegistered?: boolean }) | undefined;
}

let redisQueue: Redis;

/**
 * Create Upstash Redis client for queues and auth
 */
function createRedisQueueClient(): Redis {
  // Check for Upstash REST API credentials
  if (!process.env.UPSTASH_REDIS_URL || !process.env.UPSTASH_REDIS_TOKEN) {
    throw new Error(
      "Missing Upstash Redis credentials. Please set UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN"
    );
  }

  const client = new Redis({
    url: process.env.UPSTASH_REDIS_URL,
    token: process.env.UPSTASH_REDIS_TOKEN,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(retryCount * 100, 3000),
    },
  });

  console.log("✅ Upstash Redis: Client initialized");

  return client;
}

/**
 * Get or create Upstash Redis client (singleton)
 */
function getRedisQueueClient(): Redis {
  if (!redisQueue) {
    redisQueue = global.redisQueue ?? createRedisQueueClient();

    // In development, store in global to prevent hot-reload issues
    if (process.env.NODE_ENV !== "production") {
      global.redisQueue = redisQueue;
    }
  }

  return redisQueue;
}

/**
 * Graceful shutdown handler for Upstash Redis
 * Note: Upstash is REST-based, no persistent connection to close
 */
function gracefulShutdown(signal: string): void {
  console.log(`\n🔄 Upstash Redis: Received ${signal}, cleaning up...`);
  console.log("✅ Upstash Redis: Cleanup complete (REST client, no connections to close)");
  process.exit(0);
}

/**
 * Register shutdown handlers
 */
function registerShutdownHandlers(): void {
  // Prevent multiple registrations
  if (global.redisQueue?.__shutdownHandlersRegistered) {
    return;
  }

  // Handle termination signals - use .once() to prevent duplicate handlers
  process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  process.once("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

  // Mark handlers as registered
  if (global.redisQueue) {
    global.redisQueue.__shutdownHandlersRegistered = true;
  }

  console.log("✅ Upstash Redis: Graceful shutdown handlers registered");
}

// Initialize client
const client = getRedisQueueClient();
registerShutdownHandlers();

export { client as redisQueue };
export const getRedisQueueConnection = () => redisQueue;
