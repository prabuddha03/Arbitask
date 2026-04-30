/**
 * @fileoverview Write-Through Caching Strategy
 *
 * Pattern: Write to cache and database simultaneously
 * 1. Write to cache
 * 2. Write to database
 * 3. Both must succeed
 *
 * Best for: Write-heavy operations where cache must always be fresh
 * Use case: Creating new articles, updating user profiles
 */

import { RedisClientType } from "redis";

export class WriteThroughStrategy {
  constructor(private redis: RedisClientType) {}

  /**
   * Write data to both cache and database
   * @param key Cache key
   * @param writeFn Function to write data to database
   * @param ttl Time to live in seconds
   */
  async write<T>(key: string, data: T, writeFn: (data: T) => Promise<T>, ttl: number): Promise<T> {
    try {
      // 1. Write to database first (source of truth)
      const savedData = await writeFn(data);

      // 2. Write to cache
      await this.redis.setEx(key, ttl, JSON.stringify(savedData));

      return savedData;
    } catch (error) {
      console.error("Write-Through Error:", error);

      // If database write fails, don't cache
      // If cache write fails after DB success, that's okay
      throw error;
    }
  }

  /**
   * Update data in both cache and database
   */
  async update<T>(
    key: string,
    data: Partial<T>,
    updateFn: (data: Partial<T>) => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      // 1. Update in database
      const updatedData = await updateFn(data);

      // 2. Update cache
      await this.redis.setEx(key, ttl, JSON.stringify(updatedData));

      return updatedData;
    } catch (error) {
      console.error("Write-Through Update Error:", error);
      throw error;
    }
  }

  /**
   * Delete data from both cache and database
   */
  async delete(key: string, deleteFn: () => Promise<void>): Promise<void> {
    try {
      // 1. Delete from database
      await deleteFn();

      // 2. Delete from cache
      await this.redis.del(key);
    } catch (error) {
      console.error("Write-Through Delete Error:", error);
      throw error;
    }
  }

  /**
   * Batch write multiple items
   */
  async batchWrite<T>(
    items: Array<{ key: string; data: T }>,
    writeFn: (data: T) => Promise<T>,
    ttl: number
  ): Promise<T[]> {
    const results: T[] = [];

    for (const item of items) {
      const result = await this.write(item.key, item.data, writeFn, ttl);
      results.push(result);
    }

    return results;
  }
}
