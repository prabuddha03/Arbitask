/**
 * @fileoverview Higher-order function to wrap route handlers with middleware
 *
 * Provides: Auth, Rate Limiting, Validation, Logging, Error Handling
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createLogContext,
  logRequest,
  logResponse,
  logErrorResponse,
} from "../middlewares/logging.middleware";
import { authenticateRequest, optionalAuth, type AuthUser } from "../middlewares/auth.middleware";
import { checkRateLimit, type RateLimitConfig } from "../middlewares/rate-limit.middleware";
import { validateRequestBody } from "../validation/validation";
import { handleError } from "../middlewares/error.middleware";
import { addRequestIdToResponse } from "../middlewares/request-id.middleware";

export interface RequestContext {
  user: AuthUser | null;
  requestId: string;
  ip: string;
  userAgent?: string;
}

export type RouteHandler = (
  req: NextRequest,
  context: RequestContext
) => Promise<NextResponse | Response>;

export interface MiddlewareOptions {
  auth?: boolean;
  optionalAuth?: boolean;
  rateLimit?: RateLimitConfig;
  validateBody?: z.Schema;
  roles?: string[];
}

/**
 * Wrap route handler with middleware pipeline
 */
export function withMiddleware(
  handler: RouteHandler,
  options: MiddlewareOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // Create log context
    const logContext = createLogContext(req);

    // Log incoming request
    logRequest(logContext);

    try {
      // 1. Authentication
      let user: AuthUser | null = null;

      if (options.auth) {
        user = await authenticateRequest(req as NextRequest);
        logContext.userId = user.id;
      } else if (options.optionalAuth) {
        user = await optionalAuth(req as NextRequest);
        if (user) {
          logContext.userId = user.id;
        }
      }

      // 2. Role-based access control
      if (options.roles && user) {
        if (!options.roles.includes(user.role)) {
          throw new ApiError(403, `Requires one of: ${options.roles.join(", ")}`);
        }
      }

      // 3. Rate limiting
      if (options.rateLimit) {
        await checkRateLimit(req, user, options.rateLimit);
      }

      // 4. Body validation
      if (
        options.validateBody &&
        (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
      ) {
        const body = await validateRequestBody(req, options.validateBody);
        // Attach validated body to request (we'll need to pass it differently)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).__validatedBody = body;
      }

      // 5. Build context
      const context: RequestContext = {
        user,
        requestId: logContext.requestId,
        ip: logContext.ip || "unknown",
        userAgent: logContext.userAgent,
      };

      // 6. Call handler
      const response = await handler(req, context);

      // 7. Add standard headers
      const nextResponse =
        response instanceof NextResponse ? response : new NextResponse(response.body, response);
      addRequestIdToResponse(nextResponse, context.requestId);
      nextResponse.headers.set("X-Response-Time", `${Date.now() - logContext.startTime}ms`);

      // 8. Log success
      logResponse(logContext, nextResponse.status);

      return nextResponse;
    } catch (error) {
      // Log error
      logErrorResponse(logContext, error as Error, 500);

      // Handle error
      const errorResponse = handleError(error, logContext.requestId);
      return errorResponse instanceof NextResponse
        ? errorResponse
        : new NextResponse(errorResponse.body, errorResponse);
    }
  };
}

/**
 * Get validated body from request (if validation was applied)
 */
export function getValidatedBody<T>(req: NextRequest): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req as any).__validatedBody;
}

// Re-export ApiError for convenience
import { ApiError } from "../middlewares/error.middleware";
export { ApiError };
