/**
 * @fileoverview Queue service using Upstash Redis
 *
 * Features:
 * - Job queues for background tasks
 * - Rate limiting
 * - Session management
 * - OTP storage
 */

import { Redis } from "@upstash/redis";
import { redisQueue } from "./redis-queue";

class QueueService {
  private redis: Redis;

  constructor() {
    this.redis = redisQueue;
  }

  // ============================================
  // Job Queue Operations
  // ============================================

  /**
   * Add job to queue
   */
  async enqueue(queueName: string, job: any): Promise<void> {
    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`;
    const jobData = {
      id: jobId,
      data: job,
      createdAt: Date.now(),
      status: "pending",
    };

    await this.redis.lpush(`queue:${queueName}`, JSON.stringify(jobData));
  }

  /**
   * Dequeue job from queue
   */
  async dequeue(queueName: string): Promise<any | null> {
    const job = await this.redis.rpop(`queue:${queueName}`);
    return job ? JSON.parse(job as string) : null;
  }

  /**
   * Get queue length
   */
  async getQueueLength(queueName: string): Promise<number> {
    return (await this.redis.llen(`queue:${queueName}`)) as number;
  }

  // ============================================
  // Rate Limiting
  // ============================================

  /**
   * Check rate limit using INCR-based fixed window
   * 
   * Uses simple counter + TTL instead of ZSET sliding window:
   * - Old approach: ZREMRANGEBYSCORE, ZCARD, ZADD, EXPIRE (4 commands)
   * - New approach: INCR, conditional EXPIRE (2 commands max)
   * 
   * Fixed window is sufficient for coarse limits (per minute/hour).
   * This reduces Upstash Redis costs by ~50%.
   * 
   * @returns true if allowed, false if rate limited
   */
  async checkRateLimit(
    key: string,
    max: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const rateLimitKey = `ratelimit:${key}`;

    // Increment counter (creates key with value 1 if doesn't exist)
    const count = (await this.redis.incr(rateLimitKey)) as number;

    // Set TTL only on first request of the window
    if (count === 1) {
      await this.redis.expire(rateLimitKey, windowSeconds);
    }

    // Get TTL for reset time calculation
    const ttl = (await this.redis.ttl(rateLimitKey)) as number;
    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    if (count > max) {
      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    return {
      allowed: true,
      remaining: max - count,
      resetAt,
    };
  }

  // ============================================
  // Session Management
  // ============================================

  /**
   * Store session
   */
  async setSession(sessionId: string, data: any, ttlSeconds: number): Promise<void> {
    await this.redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
  }

  /**
   * Get session
   */
  async getSession(sessionId: string): Promise<any | null> {
    const session = await this.redis.get(`session:${sessionId}`);
    if (!session) {
      return null;
    }
    // Upstash Redis may return already parsed JSON or a string
    if (typeof session === "string") {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
    // Already an object
    return session;
  }

  /**
   * Delete session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.redis.del(`session:${sessionId}`);
  }

  // ============================================
  // OTP Management
  // ============================================

  /**
   * Store OTP
   */
  async setOTP(identifier: string, otp: string, ttlSeconds: number = 300): Promise<void> {
    await this.redis.setex(`otp:${identifier}`, ttlSeconds, otp);
  }

  /**
   * Verify OTP
   */
  async verifyOTP(identifier: string, otp: string): Promise<boolean> {
    const storedOTP = await this.redis.get(`otp:${identifier}`);
    if (!storedOTP) {
      return false;
    }

    if (storedOTP === otp) {
      // Delete OTP after successful verification
      await this.redis.del(`otp:${identifier}`);
      return true;
    }

    return false;
  }

  /**
   * Delete OTP
   */
  async deleteOTP(identifier: string): Promise<void> {
    await this.redis.del(`otp:${identifier}`);
  }

  // ============================================
  // Token Management
  // ============================================

  /**
   * Store auth token
   */
  async setToken(tokenId: string, data: any, ttlSeconds: number): Promise<void> {
    await this.redis.setex(`token:${tokenId}`, ttlSeconds, JSON.stringify(data));
  }

  /**
   * Get token data
   */
  async getToken(tokenId: string): Promise<any | null> {
    const token = await this.redis.get(`token:${tokenId}`);
    if (!token) {
      return null;
    }
    // Upstash Redis may return already parsed JSON or a string
    if (typeof token === "string") {
      try {
        return JSON.parse(token);
      } catch {
        return null;
      }
    }
    // Already an object
    return token;
  }

  /**
   * Revoke token
   */
  async revokeToken(tokenId: string): Promise<void> {
    await this.redis.del(`token:${tokenId}`);
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    return ((await this.redis.exists(key)) as number) > 0;
  }

  /**
   * Set with TTL
   */
  async setex(key: string, ttl: number, value: any): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  /**
   * Get value
   */
  async get(key: string): Promise<any | null> {
    const value = await this.redis.get(key);
    return value ? (typeof value === "string" ? JSON.parse(value) : value) : null;
  }

  /**
   * Delete key
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Get and delete value atomically (Redis 6.2+ GETDEL)
   * Combines GET + DEL into 1 command - saves 1 Redis call
   * Useful for OTP verification where we read and immediately delete
   */
  async getdel(key: string): Promise<any | null> {
    const value = await this.redis.getdel(key);
    return value ? (typeof value === "string" ? JSON.parse(value) : value) : null;
  }
}

// Export singleton instance
export const queue = new QueueService();
