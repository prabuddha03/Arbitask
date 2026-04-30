/**
 * @fileoverview TTL (Time To Live) configuration for different data types
 *
 * All values are in seconds
 */

export const TTL = {
  // User data
  USER: 60 * 5, // 5 minutes
  USER_PROFILE: 60 * 10, // 10 minutes
  USER_PREFERENCES: 60 * 30, // 30 minutes

  // Thread/Article data
  THREAD: 60 * 5, // 5 minutes
  THREAD_LIST: 60 * 2, // 2 minutes (frequently changing)
  THREAD_BY_SLUG: 60 * 10, // 10 minutes

  // Writer data
  WRITER: 60 * 10, // 10 minutes
  WRITER_PROFILE: 60 * 15, // 15 minutes
  WRITER_METRICS: 60 * 5, // 5 minutes

  // Product/Book data
  PRODUCT: 60 * 10, // 10 minutes
  PRODUCT_LIST: 60 * 5, // 5 minutes
  PRODUCT_METRICS: 60 * 5, // 5 minutes

  // Homepage content
  HOMEPAGE_SECTIONS: 60 * 15, // 15 minutes
  HOMEPAGE_FEATURED: 60 * 10, // 10 minutes

  // Metrics & Counters (temporary, will be flushed)
  METRICS_BUFFER: 60, // 1 minute
  VIEW_COUNTER: 30, // 30 seconds
  LIKE_COUNTER: 30, // 30 seconds

  // Auth & Session (Upstash)
  AUTH_TOKEN: 60 * 60 * 24, // 24 hours
  REFRESH_TOKEN: 60 * 60 * 24 * 30, // 30 days
  OTP_CODE: 60 * 5, // 5 minutes
  SESSION: 60 * 60 * 24 * 7, // 7 days

  // Rate limiting (Upstash)
  RATE_LIMIT: 60, // 1 minute window

  // Search cache
  SEARCH_RESULTS: 60 * 5, // 5 minutes
} as const;

/**
 * Cache key prefixes to organize data
 */
export const CACHE_PREFIX = {
  USER: "user",
  THREAD: "thread",
  WRITER: "writer",
  PRODUCT: "product",
  METRICS: "metrics",
  SESSION: "session",
  OTP: "otp",
  RATE_LIMIT: "ratelimit",
  QUEUE: "queue",
} as const;
