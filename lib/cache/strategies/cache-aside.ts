/**
 * @fileoverview Cache-Aside (Lazy Loading) Strategy
 *
 * Pattern: Read-Through Caching
 * 1. Check cache
 * 2. If miss, fetch from database
 * 3. Store in cache for future requests
 * 4. Return data
 *
 * Best for: Read-heavy operations with infrequent updates
 */

import { RedisClientType } from "redis";

export class CacheAsideStrategy {
  constructor(private redis: RedisClientType) {}

  /**
   * Get data with cache-aside pattern
   * @param key Cache key
   * @param fetchFn Function to fetch data from database
   * @param ttl Time to live in seconds
   */
  async get<T>(key: string, fetchFn: () => Promise<T>, ttl: number): Promise<T> {
    try {
      // 1. Try to get from cache
      const cached = await this.redis.get(key);

      if (cached) {
        // Cache hit
        return JSON.parse(cached) as T;
      }

      // 2. Cache miss - fetch from database
      const data = await fetchFn();

      // 3. Store in cache for future requests
      await this.set(key, data, ttl);

      return data;
    } catch (error) {
      console.error("Cache-Aside Error:", error);
      // Fallback to database on cache failure
      return await fetchFn();
    }
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redis.setEx(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error("Cache Set Error:", error);
      // Don't throw - cache failures shouldn't break the app
    }
  }

  /**
   * Invalidate cache entry
   */
  async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error("Cache Invalidation Error:", error);
    }
  }

  /**
   * Invalidate multiple cache entries by pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(keys);
      }
    } catch (error) {
      console.error("Cache Pattern Invalidation Error:", error);
    }
  }
}
