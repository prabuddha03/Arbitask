import NodeCache from "node-cache";

/**
 * @fileoverview In-memory cache client using node-cache
 *
 * Features:
 * - Extremely fast access (L1 cache)
 * - Automatic TTL expiry
 * - Singleton pattern
 * - Ideal for static data (categories, settings, configs)
 */

declare global {
  var memoryCache: (NodeCache & { __shutdownHandlersRegistered?: boolean }) | undefined;
}

let memoryCache: NodeCache;

/**
 * Create NodeCache instance
 * Default TTL: 1 hour (3600s)
 * Check period: 10 minutes (600s)
 */
function createMemoryCacheClient(): NodeCache {
  const client = new NodeCache({
    stdTTL: 3600,
    checkperiod: 600,
    useClones: false, // Better performance, but be careful with mutations
    deleteOnExpire: true,
  });

  console.log("✅ Memory Cache: Client initialized");
  return client;
}

/**
 * Get or create Memory Cache client (singleton)
 */
function getMemoryCacheClient(): NodeCache {
  if (!memoryCache) {
    memoryCache = global.memoryCache ?? createMemoryCacheClient();

    // In development, store in global to prevent hot-reload issues
    if (process.env.NODE_ENV !== "production") {
      global.memoryCache = memoryCache;
    }
  }

  return memoryCache;
}

// Initialize client
const client = getMemoryCacheClient();

export { client as memoryCache };
export const getMemoryCacheConnection = () => memoryCache;
