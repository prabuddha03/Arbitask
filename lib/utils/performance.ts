/**
 * @fileoverview Utility functions related to API performance and response times.
 * @function getSpeedCategory categorizes an API response time (in milliseconds) into a human-readable speed label.
 *
 * Useful for logging, performance analytics, and dashboard visualization.
 *
 */

// Colors
import { colorCodes } from "./logger";

/**
 * @param {number} durationMs - API response duration in milliseconds.
 * @returns {string} A string representing the performance category.
 */
export function getSpeedCategory(durationMs: number): string {
  if (durationMs < 1000) return `🟢 ${colorCodes.success + "Very Fast" + colorCodes.reset}`;
  if (durationMs < 2000) return `🟢 ${colorCodes.success + "Fast" + colorCodes.reset}`;
  if (durationMs < 4000) return `🟡 ${colorCodes.warning + "Moderate" + colorCodes.reset}`;
  if (durationMs < 7000) return `🟠 ${colorCodes.warning + "Slow" + colorCodes.reset}`;
  if (durationMs < 10000) return `🔴 ${colorCodes.error + "Very Slow" + colorCodes.reset}`;
  return `🔴 ${colorCodes.error + "Extremely Slow" + colorCodes.reset}`;
}
