/**
 * @fileoverview Build-time detection utilities
 *
 * Utilities to detect if code is running during build time and skip expensive operations
 */

/**
 * Check if code is running during build time
 * @returns true if running during Next.js build phase
 */
export function isBuildTime(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build";
}

/**
 * Skip expensive operations during build
 * Returns fallback value if running during build, otherwise executes the function
 *
 * @example
 * ```typescript
 * const data = await skipDuringBuild(
 *   () => fetchExpensiveData(),
 *   { data: [], meta: { pagination: { page: 1, totalPages: 0 } } }
 * );
 * ```
 */
export async function skipDuringBuild<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (isBuildTime()) {
    console.log("[Build] Skipping operation during build time");
    return fallback;
  }
  return fn();
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
