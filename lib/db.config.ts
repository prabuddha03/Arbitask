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
  const url = baseUrl || process.env.DATABASE_URL || "file:./prisma/dev.db";

  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set("connection_limit", dbConfig.connectionLimit.toString());
    urlObj.searchParams.set("pool_timeout", dbConfig.poolTimeout.toString());
    urlObj.searchParams.set("connect_timeout", dbConfig.connectionTimeout.toString());
    return urlObj.toString();
  } catch {
    // SQLite file:// URLs are not valid URL objects — return as-is
    return url;
  }
}

/**
 * Validate database configuration
 */
export function validateDbConfig(): void {
  if (!process.env.DATABASE_URL) {
    // During Next.js build, DATABASE_URL may not be set — warn but don't crash
    // The error will surface at runtime when an actual query is made
    console.warn(
      "⚠️  DATABASE_URL is not set. Using SQLite fallback (file:./prisma/dev.db). " +
        "Set DATABASE_URL in .env.local for production."
    );
    return;
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
