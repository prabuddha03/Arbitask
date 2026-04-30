/**
 * @fileoverview Simple file-based logging utility for server-side operations.
 *
 * Each log entry includes a timestamp, log level, message, and optional metadata.
 *
 * ## Example
 * ```ts
 * logError('Database connection failed', { db: 'primary', reason: err.message });
 * logInfo('Server started successfully', { port: 3000 });
 * ```
 */

// Types
import { LogMetadataProps, ReqOptionsProps } from "@/types/utils/logger";

/**
 * @param {ReqOptionsProps} reqOptions - Request options object containing method and pathname.
 * @param {LogMetadataProps} meta - Optional metadata object for additional context.
 * @returns {void} - Prints the log to the console.
 */
export function logError(reqOptions: ReqOptionsProps, meta?: LogMetadataProps): void {
  const log = `${colorCodes.dim}[${getDateString()}]${colorCodes.reset} ${colorCodes.error}ERROR: ${reqOptions.method} ${reqOptions.pathname} ❌ failed${colorCodes.reset} ${
    meta ? `\n` + formatMetaData(meta) : ""
  }\n`;
  console.error(log);
}

/**
 * @param {ReqOptionsProps} reqOptions - Request options object containing method and pathname.
 * @param {LogMetadataProps} meta - Optional metadata object for additional context.
 * @returns {void} - Prints the log to the console.
 */
export function logInfo(reqOptions: ReqOptionsProps, meta?: LogMetadataProps): void {
  const log = `[${getDateString()}] ${colorCodes.success}INFO: ${reqOptions.method} ${reqOptions.pathname} ✅ successful ${colorCodes.reset} ${
    meta ? "\n" + formatMetaData(meta) : ""
  }\n`;
  console.info(log);
}

/**
 * @returns {string} - The current date in YYYY-MM-DD format.
 */
function getDateString(): string {
  return new Date().toISOString();
}

/**
 * Object containing color codes for console output.
 */
export const colorCodes = {
  success: "\x1b[32m",
  error: "\x1b[31m",
  warning: "\x1b[33m",
  reset: "\x1b[0m",
  dim: "\x1b[2m",
};

/**
 *
 * @param {LogMetadataProps} meta - The metadata object to format.
 * @returns {string} - A formatted string representation of the metadata.
 */
function formatMetaData(meta: LogMetadataProps): string {
  if (!meta) return "";
  return Object.entries(meta)
    .map(([key, value]) => {
      if (key === "status") {
        if ((value as number) >= 400) {
          return `${key}: ${colorCodes.error}${value}${colorCodes.reset}`;
        } else {
          return `${key}: ${colorCodes.success}${value}${colorCodes.reset}`;
        }
      } else if (key === "duration") {
        return `${key}: ${colorCodes.dim}${value}ms${colorCodes.reset}`;
      } else if (key === "error") {
        return `${key}: ${colorCodes.dim}${value}${colorCodes.reset}`;
      } else {
        return `${key}: ${value}`;
      }
    })
    .join("\n");
}
