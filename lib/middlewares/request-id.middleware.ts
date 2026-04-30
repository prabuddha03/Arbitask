/**
 * @fileoverview Request ID generation and propagation
 */

import { randomBytes } from "crypto";

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(8).toString("hex");
  return `req_${timestamp}_${random}`;
}

/**
 * Extract request ID from headers or generate new one
 */
export function getOrCreateRequestId(req: Request): string {
  const existingId = req.headers.get("x-request-id");
  return existingId || generateRequestId();
}

/**
 * Add request ID to response headers
 */
export function addRequestIdToResponse(response: Response, requestId: string): Response {
  response.headers.set("X-Request-Id", requestId);
  return response;
}
