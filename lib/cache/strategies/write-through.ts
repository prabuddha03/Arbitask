/**
 * @fileoverview Write-Through strategy stub
 * Redis implementation removed (Inscript dependency). Use memoryCache directly.
 */
import { memoryCache } from "../memory-cache";

export class WriteThroughStrategy {
  async create<T>(key: string, creator: () => Promise<T>, ttl?: number): Promise<T> {
    const value = await creator();
    memoryCache.set(key, value, ttl);
    return value;
  }

  async update<T>(key: string, updater: () => Promise<T>, ttl?: number): Promise<T> {
    const value = await updater();
    memoryCache.set(key, value, ttl);
    return value;
  }

  async delete(key: string, deleter: () => Promise<void>): Promise<void> {
    await deleter();
    memoryCache.del(key);
  }
}
