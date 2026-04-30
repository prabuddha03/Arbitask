/**
 * @fileoverview Write-Behind (Write-Back) Caching Strategy
 *
 * Pattern: Write to cache immediately, database asynchronously
 * 1. Write to cache (fast response)
 * 2. Queue database write for later
 * 3. Batch writes to database periodically
 *
 * Best for: High-volume writes (views, likes, metrics)
 * ⚠️ Risk: Data loss if cache fails before DB write
 */

import { RedisClientType } from "redis";
import { EventEmitter } from "events";

interface WriteBehindQueueItem<T> {
  key: string;
  data: T;
  timestamp: number;
}

export class WriteBehindStrategy extends EventEmitter {
  private writeQueue: Map<string, WriteBehindQueueItem<any>> = new Map();
  private flushInterval: NodeJS.Timeout | null = null;
  private batchSize: number;
  private flushIntervalMs: number;

  constructor(
    private redis: RedisClientType,
    options: {
      batchSize?: number;
      flushIntervalMs?: number;
    } = {}
  ) {
    super();
    this.batchSize = options.batchSize ?? 100;
    this.flushIntervalMs = options.flushIntervalMs ?? 10000; // 10 seconds

    // Start periodic flush
    this.startPeriodicFlush();
  }

  /**
   * Increment counter in cache (for views, likes, etc.)
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      const newValue = await this.redis.incrBy(key, by);

      // Queue for database sync
      this.queueWrite(key, { increment: by });

      return newValue;
    } catch (error) {
      console.error("Write-Behind Increment Error:", error);
      throw error;
    }
  }

  /**
   * Set value in cache immediately, queue database write
   */
  async set<T>(
    key: string,
    data: T,
    ttl: number,
    dbWriteFn: (data: T) => Promise<void>
  ): Promise<void> {
    try {
      // 1. Write to cache immediately (fast)
      await this.redis.setEx(key, ttl, JSON.stringify(data));

      // 2. Queue database write (async)
      this.queueWrite(key, data, dbWriteFn);
    } catch (error) {
      console.error("Write-Behind Set Error:", error);
      throw error;
    }
  }

  /**
   * Queue a write operation for later
   */
  private queueWrite<T>(key: string, data: T, dbWriteFn?: (data: T) => Promise<void>): void {
    this.writeQueue.set(key, {
      key,
      data,
      timestamp: Date.now(),
    });

    // Store the DB write function if provided
    if (dbWriteFn) {
      (this.writeQueue.get(key) as any).dbWriteFn = dbWriteFn;
    }

    // Flush immediately if queue is full
    if (this.writeQueue.size >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush queued writes to database
   */
  async flush(): Promise<void> {
    if (this.writeQueue.size === 0) {
      return;
    }

    const items = Array.from(this.writeQueue.values());
    this.writeQueue.clear();

    console.log(`🔄 Flushing ${items.length} queued writes to database...`);

    // Process writes
    const promises = items.map(async (item) => {
      try {
        if ((item as any).dbWriteFn) {
          await (item as any).dbWriteFn(item.data);
        }
        this.emit("write:success", item.key);
      } catch (error) {
        console.error("Write-Behind Flush Error for key:", item.key, error);
        this.emit("write:error", item.key, error);
      }
    });

    await Promise.allSettled(promises);
    console.log("✅ Flush complete");
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);

    // Graceful shutdown
    process.once("beforeExit", async () => {
      console.log("🔄 Write-Behind: Flushing remaining writes before exit...");
      await this.flush();
      if (this.flushInterval) {
        clearInterval(this.flushInterval);
      }
    });
  }

  /**
   * Stop periodic flush
   */
  stop(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.writeQueue.size;
  }
}
