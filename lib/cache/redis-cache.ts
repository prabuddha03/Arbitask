import { createClient, RedisClientType } from "redis";

/**
 * @fileoverview Redis Enterprise client for high-performance caching
 *
 * Features:
 * - Singleton pattern
 * - Connection pooling
 * - Graceful shutdown (process.once)
 * - Auto-reconnect with exponential backoff
 */

declare global {
  var redisCache: (RedisClientType & { __shutdownHandlersRegistered?: boolean }) | undefined;
}

let redisCache: RedisClientType;

/**
 * Create Redis Enterprise client for caching
 */
function createRedisCacheClient(): RedisClientType {
  const client = createClient({
    url: process.env.REDIS_CACHE_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) {
          console.error("❌ Redis Cache: Max reconnection attempts reached");
          return new Error("Max reconnection attempts reached");
        }
        // Exponential backoff: 100ms, 200ms, 400ms
        return Math.min(retries * 100, 3000);
      },
    },
  });

  // Error handling
  client.on("error", (err) => {
    console.error("❌ Redis Cache Error:", err);
  });

  client.on("connect", () => {
    console.log("🔗 Redis Cache: Connecting...");
  });

  client.on("ready", () => {
    console.log("✅ Redis Cache: Connected and ready");
  });

  client.on("reconnecting", () => {
    console.log("🔄 Redis Cache: Reconnecting...");
  });

  return client as unknown as RedisClientType;
}

/**
 * Get or create Redis Cache client (singleton)
 */
async function getRedisCacheClient(): Promise<RedisClientType> {
  if (!redisCache) {
    redisCache = global.redisCache ?? createRedisCacheClient();

    // In development, store in global to prevent hot-reload issues
    if (process.env.NODE_ENV !== "production") {
      global.redisCache = redisCache;
    }
  }

  // Connect to Redis only if not already connected
  if (!redisCache.isOpen) {
    await redisCache.connect();
  }

  return redisCache;
}

/**
 * Graceful shutdown handler for Redis Cache
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🔄 Redis Cache: Received ${signal}, closing connections...`);

  try {
    if (redisCache && redisCache.isOpen) {
      await redisCache.quit();
      console.log("✅ Redis Cache: Connections closed successfully");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Redis Cache: Error during disconnect:", error);
    process.exit(1);
  }
}

/**
 * Register shutdown handlers
 */
function registerShutdownHandlers(): void {
  // Prevent multiple registrations
  if (global.redisCache?.__shutdownHandlersRegistered) {
    return;
  }

  // Handle termination signals - use .once() to prevent duplicate handlers
  process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  process.once("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

  // Handle process exit
  process.once("beforeExit", async () => {
    console.log("🔄 Redis Cache: Process exiting, cleaning up connections...");
    if (redisCache && redisCache.isOpen) {
      await redisCache.quit();
    }
  });

  // Mark handlers as registered
  if (global.redisCache) {
    global.redisCache.__shutdownHandlersRegistered = true;
  }

  console.log("✅ Redis Cache: Graceful shutdown handlers registered");
}

// Initialize client (lazy - only connects when first used)
export const initRedisCacheClient = async () => {
  const client = await getRedisCacheClient();
  registerShutdownHandlers();
  return client;
};

// Export getter
export const getRedisCacheConnection = () => redisCache;
