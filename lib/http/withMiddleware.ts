/**
 * @fileoverview Higher-order function to wrap route handlers with middleware
 *
 * Provides: Auth (via Auth.js v5), Rate Limiting, Validation, Logging, Error Handling
 *
 * Auth strategy: uses Auth.js `auth()` session cookies — NOT Inscript Redis tokens.
 * The app uses NextAuth v5 JWT sessions (authjs.session-token cookie).
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createLogContext,
  logRequest,
  logResponse,
  logErrorResponse,
} from "../middlewares/logging.middleware";
import { checkRateLimit, type RateLimitConfig } from "../middlewares/rate-limit.middleware";
import { validateRequestBody } from "../validation/validation";
import { handleError, ApiError } from "../middlewares/error.middleware";
import { addRequestIdToResponse } from "../middlewares/request-id.middleware";
import { ApiErrors } from "../middlewares/error.middleware";
import { auth } from "@/lib/auth";

// ─── AuthUser aligned with Arbitask's Prisma User (id: string cuid) ──────────

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: string;
}

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
 * Resolve an Auth.js v5 session into an AuthUser.
 * Returns null if no active session.
 */
async function resolveAuthUser(): Promise<AuthUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name,
    image: session.user.image,
    role: "member", // All authenticated users are members; project-level RBAC done in services
  };
}

/**
 * Wrap route handler with the full middleware pipeline.
 * Authentication uses Auth.js v5 session cookies.
 */
export function withMiddleware(
  handler: RouteHandler,
  options: MiddlewareOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const logContext = createLogContext(req);
    logRequest(logContext);

    try {
      // 1. Authentication — Auth.js v5 session
      let user: AuthUser | null = null;

      if (options.auth) {
        user = await resolveAuthUser();
        if (!user) throw ApiErrors.Unauthorized("You must be signed in to access this resource");
        logContext.userId = user.id;
      } else if (options.optionalAuth) {
        user = await resolveAuthUser();
        if (user) logContext.userId = user.id;
      }

      // 2. Role-based access control (app-level role, not project-level)
      if (options.roles && user) {
        if (!options.roles.includes(user.role)) {
          throw ApiErrors.Forbidden(`Requires one of: ${options.roles.join(", ")}`);
        }
      }

      // 3. Rate limiting
      if (options.rateLimit) {
        await checkRateLimit(req, user as any, options.rateLimit);
      }

      // 4. Body validation — validated body attached to req.__validatedBody
      if (
        options.validateBody &&
        (req.method === "POST" || req.method === "PUT" || req.method === "PATCH")
      ) {
        const body = await validateRequestBody(req, options.validateBody);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).__validatedBody = body;
      }

      // 5. Build request context
      const context: RequestContext = {
        user,
        requestId: logContext.requestId,
        ip: logContext.ip || "unknown",
        userAgent: logContext.userAgent,
      };

      // 6. Call handler
      const response = await handler(req, context);

      // 7. Add standard response headers
      const nextResponse =
        response instanceof NextResponse ? response : new NextResponse(response.body, response);
      addRequestIdToResponse(nextResponse, context.requestId);
      nextResponse.headers.set("X-Response-Time", `${Date.now() - logContext.startTime}ms`);

      // 8. Log success
      logResponse(logContext, nextResponse.status);

      return nextResponse;
    } catch (error) {
      logErrorResponse(logContext, error as Error, 500);
      const errorResponse = handleError(error, logContext.requestId);
      return errorResponse instanceof NextResponse
        ? errorResponse
        : new NextResponse(errorResponse.body, errorResponse);
    }
  };
}

/**
 * Get validated body from request (attached by withMiddleware body validation step)
 */
export function getValidatedBody<T>(req: NextRequest): T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (req as any).__validatedBody;
}

export { ApiError };
