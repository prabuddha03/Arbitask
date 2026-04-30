/**
 * @fileoverview Health check API route
 *
 * GET /api/health — Returns service health status including DB connectivity.
 * Used by DigitalOcean App Platform health checks, uptime monitors, and Sentry.
 *
 * @openapi
 * /api/health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Service health check
 *     description: |
 *       Returns the health status of all system components:
 *       - API server status
 *       - Database connectivity (Prisma → PostgreSQL/SQLite)
 *       - Response latency
 *       - Build metadata (version, environment, uptime)
 *
 *       This endpoint is **public** (no auth required) and is used by:
 *       - DigitalOcean App Platform health check probes
 *       - Uptime monitors (e.g. Better Uptime, UptimeRobot)
 *       - Sentry health check alerts
 *     responses:
 *       200:
 *         description: All systems healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 uptime:
 *                   type: number
 *                   description: Process uptime in seconds
 *                 version:
 *                   type: string
 *                   example: "0.0.1"
 *                 environment:
 *                   type: string
 *                   example: production
 *                 components:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: healthy
 *                         latencyMs:
 *                           type: number
 *                           example: 12
 *       503:
 *         description: One or more components are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: unhealthy
 *                 components:
 *                   type: object
 */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic"; // Never cache health checks

interface ComponentHealth {
  status: "healthy" | "unhealthy";
  latencyMs?: number;
  error?: string;
}

interface HealthResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  components: {
    database: ComponentHealth;
  };
}

async function checkDatabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (err) {
    return {
      status: "unhealthy",
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown database error",
    };
  }
}

export async function GET(): Promise<NextResponse> {
  const [database] = await Promise.all([checkDatabase()]);

  const allHealthy = database.status === "healthy";

  const body: HealthResponse = {
    status: allHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version ?? "0.0.1",
    environment: process.env.NODE_ENV ?? "development",
    components: {
      database,
    },
  };

  return NextResponse.json(body, {
    status: allHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, no-cache",
      "X-Health-Check": "arbitask",
    },
  });
}
