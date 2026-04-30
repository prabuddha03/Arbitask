/**
 * @fileoverview In-memory cache stub
 *
 * NOTE: This replaces the Inscript `node-cache` dependency.
 * Uses a simple Map-based TTL cache. For production, swap this with
 * Vercel KV, Upstash Redis (when needed), or Next.js `unstable_cache`.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  set<T>(key: string, value: T, ttlSeconds?: number): void {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  del(key: string): void {
    this.store.delete(key);
  }

  flush(): void {
    this.store.clear();
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

export const memoryCache = new MemoryCache();
export type { MemoryCache };
