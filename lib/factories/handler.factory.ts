/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @fileoverview Handler factory - reduces boilerplate for API route handlers
 *
 * Provides a consistent pattern for creating API handlers with:
 * - Authentication
 * - Rate limiting
 * - Validation
 * - Error handling
 * - Logging
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  withMiddleware,
  successResponse,
  createdResponse,
  noContentResponse,
  notFoundResponse,
  type RequestContext,
} from "../http";
import type { RateLimitConfig } from "../middlewares";

export interface HandlerConfig {
  auth?: boolean;
  optionalAuth?: boolean;
  roles?: string[];
  rateLimit?: RateLimitConfig;
  validateBody?: z.Schema;
  validateQuery?: z.Schema;
}

export interface HandlerFunction<T = any> {
  (req: NextRequest, context: RequestContext, validated?: any): Promise<T>;
}

/**
 * Create a simple GET handler
 */
export function createGetHandler<T>(handler: HandlerFunction<T>, config: HandlerConfig = {}) {
  return withMiddleware(async (req, context) => {
    const data = await handler(req, context);
    return successResponse(data);
  }, config);
}

/**
 * Create a POST handler (for creation)
 */
export function createPostHandler<T>(handler: HandlerFunction<T>, config: HandlerConfig = {}) {
  return withMiddleware(async (req, context) => {
    const validated = config.validateBody ? (req as any).__validatedBody : undefined;
    const data = await handler(req, context, validated);
    return createdResponse(data);
  }, config);
}

/**
 * Create a PUT handler (for updates)
 */
export function createPutHandler<T>(handler: HandlerFunction<T>, config: HandlerConfig = {}) {
  return withMiddleware(async (req, context) => {
    const validated = config.validateBody ? (req as any).__validatedBody : undefined;
    const data = await handler(req, context, validated);
    return successResponse(data, { message: "Updated successfully" });
  }, config);
}

/**
 * Create a DELETE handler
 */
export function createDeleteHandler(handler: HandlerFunction<void>, config: HandlerConfig = {}) {
  return withMiddleware(async (req, context) => {
    await handler(req, context);
    return noContentResponse();
  }, config);
}

/**
 * Create a handler with custom response
 */
export function createHandler<T>(
  handler: HandlerFunction<T>,
  config: HandlerConfig & {
    responseFormatter?: (data: T) => any;
    successMessage?: string;
  } = {}
) {
  return withMiddleware(async (req, context) => {
    const validated = config.validateBody ? (req as any).__validatedBody : undefined;
    const data = await handler(req, context, validated);
    const formatted = config.responseFormatter ? config.responseFormatter(data) : data;
    return successResponse(formatted, { message: config.successMessage });
  }, config);
}

/**
 * Create a paginated handler
 */
export function createPaginatedHandler<T>(
  handler: HandlerFunction<{ items: T[]; pagination: any }>,
  config: HandlerConfig = {}
) {
  return withMiddleware(async (req, context) => {
    const result = await handler(req, context);

    return successResponse(result.items, {
      meta: { pagination: result.pagination },
    });
  }, config);
}

/**
 * Create a handler that returns a single resource or 404
 */
export function createGetOneHandler<T>(
  handler: HandlerFunction<T | null>,
  config: HandlerConfig & {
    notFoundMessage?: string;
  } = {}
) {
  return withMiddleware(async (req, context) => {
    const data = await handler(req, context);

    if (!data) {
      return notFoundResponse(config.notFoundMessage || "Resource not found", context.requestId);
    }

    return successResponse(data);
  }, config);
}
