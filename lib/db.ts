import { PrismaClient } from "@prisma/client";
import { buildDatabaseUrl, dbConfig, validateDbConfig } from "./db.config";

/**
 * @fileoverview Database connection manager with singleton pattern, connection pooling, and graceful shutdown
 *
 * Features:
 * - Singleton pattern to prevent multiple instances
 * - Connection pool configuration for optimal performance
 * - Graceful shutdown on SIGTERM, SIGINT, SIGQUIT, and other signals
 * - Proper error handling and logging
 */

// Global type augmentation for singleton
declare global {
  var prisma: (PrismaClient & { __shutdownHandlersRegistered?: boolean }) | undefined;
}

// Singleton instance
let prisma: PrismaClient;

/**
 * Initialize PrismaClient with connection pool configuration
 */
function createPrismaClient(): PrismaClient {
  // Skip validation during Next.js static build (no real DB needed)
  // Validation runs at runtime when actual queries are made
  if (process.env.NEXT_PHASE !== "phase-production-build") {
    validateDbConfig();
  }

  return new PrismaClient({
    log: dbConfig.logLevel,

    // Connection pool configuration via DATABASE_URL
    datasources: {
      db: {
        url: buildDatabaseUrl(),
      },
    },

    // Additional options for better connection management
    errorFormat: "pretty",
  });
}

/**
 * Get or create singleton PrismaClient instance
 */
function getPrismaClient(): PrismaClient {
  if (!prisma) {
    // Check if this is truly a new connection or reusing global
    const isNewConnection = !global.prisma;

    prisma = global.prisma ?? createPrismaClient();

    // In development, store in global to prevent hot-reload issues
    if (process.env.NODE_ENV !== "production") {
      global.prisma = prisma;
    }

    // Only log when actually creating a NEW connection
    if (isNewConnection) {
      console.log("Database connection established");
    }
  }

  return prisma;
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n🔄 Received ${signal}, closing database connections...`);

  try {
    if (prisma) {
      await prisma.$disconnect();
      console.log("Database connections closed successfully");
    }

    // Exit with appropriate code
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during database disconnect:", error);
    process.exit(1);
  }
}

/**
 * Register shutdown handlers for various signals
 * Uses process.once() to prevent multiple registrations during hot-reload
 */
function registerShutdownHandlers(): void {
  // Prevent multiple registrations
  if (global.prisma?.__shutdownHandlersRegistered) {
    return;
  }

  // Handle termination signals - use .once() to prevent duplicate handlers
  process.once("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.once("SIGINT", () => gracefulShutdown("SIGINT"));
  process.once("SIGQUIT", () => gracefulShutdown("SIGQUIT"));

  // Handle process exit
  process.once("beforeExit", async () => {
    console.log("🔄 Process exiting, cleaning up database connections...");
    if (prisma) {
      await prisma.$disconnect();
    }
  });

  // Handle uncaught errors
  process.once("uncaughtException", async (error) => {
    console.error("❌ Uncaught exception:", error);
    if (prisma) {
      await prisma.$disconnect();
    }
    process.exit(1);
  });

  process.once("unhandledRejection", async (reason, promise) => {
    console.error("❌ Unhandled rejection at:", promise, "reason:", reason);
    if (prisma) {
      await prisma.$disconnect();
    }
    process.exit(1);
  });

  // Mark handlers as registered
  if (global.prisma) {
    global.prisma.__shutdownHandlersRegistered = true;
  }

  console.log("✅ Graceful shutdown handlers registered");
}

// Initialize client and register handlers
const db = getPrismaClient();
registerShutdownHandlers();

// Export singleton instance
export { db };
