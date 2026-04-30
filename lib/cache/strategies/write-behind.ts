/**
 * @fileoverview Write-Behind strategy stub
 * Redis implementation removed (Inscript dependency). Use memoryCache directly.
 */
import { memoryCache } from "../memory-cache";

export class WriteBehindStrategy {
  async increment(key: string, by = 1, ttl?: number): Promise<number> {
    const current = memoryCache.get<number>(key) ?? 0;
    const next = current + by;
    memoryCache.set(key, next, ttl);
    return next;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    memoryCache.set(key, value, ttl);
  }
}
