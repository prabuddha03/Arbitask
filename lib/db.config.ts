/**
 * @fileoverview Database configuration settings
 *
 * Connection pool configuration for PostgreSQL via Prisma
 * These settings can be overridden via environment variables
 */

import type { Prisma } from "@prisma/client";

type LogLevel = Prisma.LogLevel;

export const dbConfig = {
  /**
   * Connection pool size
   * Default: connection_limit in DATABASE_URL or Prisma's default (num_cpus * 2 + 1)
   *
   * For serverless environments (Vercel, AWS Lambda), keep this low (1-5)
   * For traditional servers, use: num_cpus * 2 + 1
   */
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10),

  /**
   * Connection timeout in seconds
   * How long to wait when establishing a connection
   */
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || "5", 10),

  /**
   * Pool timeout in seconds
   * How long to wait for an available connection from the pool
   */
  poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || "10", 10),

  /**
   * Log level configuration
   */
  logLevel: (process.env.NODE_ENV === "development"
    ? ["query", "error", "warn"]
    : ["error"]) as LogLevel[],
};

/**
 * Build DATABASE_URL with connection pool parameters
 *
 * Example:
 * postgresql://user:password@host:port/database?connection_limit=10&pool_timeout=10
 *
 * @param baseUrl - Base DATABASE_URL without query parameters
 * @returns Complete DATABASE_URL with connection pool parameters
 */
export function buildDatabaseUrl(baseUrl?: string): string {
  const url = baseUrl || process.env.DATABASE_URL || "";

  if (!url) {
    throw new Error("DATABASE_URL is required and must be a PostgreSQL connection string.");
  }

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("connection_limit", dbConfig.connectionLimit.toString());
    urlObj.searchParams.set("pool_timeout", dbConfig.poolTimeout.toString());
    urlObj.searchParams.set("connect_timeout", dbConfig.connectionTimeout.toString());
    return urlObj.toString();
  } catch {
    // If URL parsing fails, return original URL and let Prisma surface a precise error.
    return url;
  }
}

/**
 * Validate database configuration
 */
export function validateDbConfig(): void {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Configure PostgreSQL DATABASE_URL in your environment."
    );
  }

  if (!process.env.DIRECT_URL) {
    throw new Error(
      "DIRECT_URL is not set. Configure PostgreSQL DIRECT_URL in your environment (use the same URL as DATABASE_URL when not using a connection pooler)."
    );
  }

  if (dbConfig.connectionLimit < 1) {
    throw new Error("DB_CONNECTION_LIMIT must be at least 1");
  }

  if (dbConfig.connectionTimeout < 1) {
    throw new Error("DB_CONNECTION_TIMEOUT must be at least 1");
  }

  if (dbConfig.poolTimeout < 1) {
    throw new Error("DB_POOL_TIMEOUT must be at least 1");
  }
}
