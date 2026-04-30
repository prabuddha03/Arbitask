/**
 * @fileoverview Cache-Aside strategy stub
 * Redis implementation removed (Inscript dependency). Use memoryCache directly.
 */
import { memoryCache } from "../memory-cache";

export class CacheAsideStrategy {
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = memoryCache.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await fetcher();
    memoryCache.set(key, value, ttl);
    return value;
  }

  async invalidate(key: string): Promise<void> {
    memoryCache.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace("*", ".*"));
    memoryCache.keys().filter((k) => regex.test(k)).forEach((k) => memoryCache.del(k));
  }
}
