/**
 * @fileoverview Main cache service with all strategies
 *
 * Provides unified interface for caching operations
 */

import { RedisClientType } from "redis";
import NodeCache from "node-cache";
import { initRedisCacheClient } from "./redis-cache";
import { memoryCache } from "./memory-cache";
import { CacheAsideStrategy } from "./strategies/cache-aside";
import { WriteThroughStrategy } from "./strategies/write-through";
import { WriteBehindStrategy } from "./strategies/write-behind";

class CacheService {
  private redis: RedisClientType | null = null;
  private memory: NodeCache;
  private cacheAsideStrategy: CacheAsideStrategy | null = null;
  private writeThroughStrategy: WriteThroughStrategy | null = null;
  private writeBehindStrategy: WriteBehindStrategy | null = null;
  private initialized: boolean = false;

  constructor() {
    this.memory = memoryCache;
  }

  /**
   * Initialize cache service
   */
  async init(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.redis = await initRedisCacheClient();
      this.cacheAsideStrategy = new CacheAsideStrategy(this.redis);
      this.writeThroughStrategy = new WriteThroughStrategy(this.redis);
      this.writeBehindStrategy = new WriteBehindStrategy(this.redis, {
        batchSize: 100,
        flushIntervalMs: 10000, // 10 seconds
      });
      this.initialized = true;
      console.log("✅ Cache Service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize cache service:", error);
      throw error;
    }
  }

  /**
   * Ensure service is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized || !this.redis) {
      throw new Error("Cache service not initialized. Call init() first.");
    }
  }

  // ============================================
  // Memory Cache (L1 - Fastest)
  // ============================================

  /**
   * Get data from in-memory cache
   */
  getMemory<T>(key: string): T | undefined {
    return this.memory.get<T>(key);
  }

  /**
   * Set data in in-memory cache
   */
  setMemory<T>(key: string, value: T, ttl?: number): boolean {
    return this.memory.set(key, value, ttl || 0);
  }

  /**
   * Get or Set memory cache (Lazy Load)
   */
  async getOrSetMemory<T>(key: string, fetchFn: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.memory.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await fetchFn();
    this.memory.set(key, value, ttl || 0);
    return value;
  }

  /**
   * Delete from memory cache
   */
  delMemory(key: string): number {
    return this.memory.del(key);
  }

  /**
   * Flush all memory cache
   */
  flushMemory(): void {
    this.memory.flushAll();
  }

  // ============================================
  // Cache-Aside (Read-Through)
  // ============================================

  /**
   * Get data with cache-aside pattern
   */
  async get<T>(key: string, fetchFn: () => Promise<T>, ttl: number): Promise<T> {
    this.ensureInitialized();
    return this.cacheAsideStrategy!.get(key, fetchFn, ttl);
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    this.ensureInitialized();
    return this.cacheAsideStrategy!.set(key, value, ttl);
  }

  /**
   * Delete cache entry
   */
  async del(key: string): Promise<void> {
    this.ensureInitialized();
    return this.cacheAsideStrategy!.invalidate(key);
  }

  /**
   * Delete multiple cache entries by pattern
   */
  async delPattern(pattern: string): Promise<void> {
    this.ensureInitialized();
    return this.cacheAsideStrategy!.invalidatePattern(pattern);
  }

  // ============================================
  // Write-Through
  // ============================================

  /**
   * Write to both cache and database
   */
  async writeThrough<T>(
    key: string,
    data: T,
    writeFn: (data: T) => Promise<T>,
    ttl: number
  ): Promise<T> {
    this.ensureInitialized();
    return this.writeThroughStrategy!.write(key, data, writeFn, ttl);
  }

  /**
   * Update in both cache and database
   */
  async updateThrough<T>(
    key: string,
    data: Partial<T>,
    updateFn: (data: Partial<T>) => Promise<T>,
    ttl: number
  ): Promise<T> {
    this.ensureInitialized();
    return this.writeThroughStrategy!.update(key, data, updateFn, ttl);
  }

  // ============================================
  // Write-Behind (High Volume)
  // ============================================

  /**
   * Increment counter (for views, likes, etc.)
   */
  async increment(key: string, by: number = 1): Promise<number> {
    this.ensureInitialized();
    return this.writeBehindStrategy!.increment(key, by);
  }

  /**
   * Write to cache immediately, database later
   */
  async writeBehind<T>(
    key: string,
    data: T,
    ttl: number,
    dbWriteFn: (data: T) => Promise<void>
  ): Promise<void> {
    this.ensureInitialized();
    return this.writeBehindStrategy!.set(key, data, ttl, dbWriteFn);
  }

  /**
   * Manually flush write-behind queue
   */
  async flushWriteBehind(): Promise<void> {
    this.ensureInitialized();
    return this.writeBehindStrategy!.flush();
  }

  // ============================================
  // Raw Redis Operations
  // ============================================

  /**
   * Get raw Redis client for custom operations
   */
  getRedisClient(): RedisClientType {
    this.ensureInitialized();
    return this.redis!;
  }

  /**
   * Check if cache is available
   */
  isAvailable(): boolean {
    return this.initialized && this.redis !== null;
  }
}

// Export singleton instance
export const cache = new CacheService();
