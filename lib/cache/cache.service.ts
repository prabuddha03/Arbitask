/**
 * @fileoverview Cache service stub
 *
 * NOTE: Inscript Redis/node-cache dependencies removed.
 * Provides a simple in-memory cache facade.
 * For distributed caching (Phase 1+), swap strategies for Upstash Redis.
 */

import { memoryCache } from "./memory-cache";

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    return memoryCache.get<T>(key) ?? null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    memoryCache.set(key, value, ttlSeconds);
  }

  async del(key: string): Promise<void> {
    memoryCache.del(key);
  }

  async has(key: string): Promise<boolean> {
    return memoryCache.has(key);
  }

  async flush(): Promise<void> {
    memoryCache.flush();
  }
}

export const cacheService = new CacheService();
export type { CacheService };
