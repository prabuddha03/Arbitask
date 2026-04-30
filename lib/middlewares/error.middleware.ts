/**
 * @fileoverview Centralized error handling middleware
 */

import { ValidationError } from "../validation/validation";

/**
 * API Error class
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Common API errors
 */
export const ApiErrors = {
  BadRequest: (message: string = "Bad request", details?: unknown) =>
    new ApiError(400, message, "BAD_REQUEST", details),

  Unauthorized: (message: string = "Unauthorized") => new ApiError(401, message, "UNAUTHORIZED"),

  Forbidden: (message: string = "Forbidden") => new ApiError(403, message, "FORBIDDEN"),

  NotFound: (message: string = "Resource not found") => new ApiError(404, message, "NOT_FOUND"),

  Conflict: (message: string = "Resource already exists") => new ApiError(409, message, "CONFLICT"),

  Gone: (message: string = "Resource is no longer available") => new ApiError(410, message, "GONE"),

  TooManyRequests: (message: string = "Too many requests", resetAt?: number) =>
    new ApiError(429, message, "TOO_MANY_REQUESTS", { resetAt }),

  InternalServerError: (message: string = "Internal server error") =>
    new ApiError(500, message, "INTERNAL_SERVER_ERROR"),

  ServiceUnavailable: (message: string = "Service unavailable") =>
    new ApiError(503, message, "SERVICE_UNAVAILABLE"),
};

/**
 * Error response format
 */
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

/**
 * Handle error and return appropriate response
 */
export function handleError(error: unknown, requestId?: string): Response {
  // Validation errors
  if (error instanceof ValidationError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: error.message,
        details: error.errors,
        requestId,
      },
    };
    return Response.json(response, { status: 400 });
  }

  // API errors
  if (error instanceof ApiError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.code || "API_ERROR",
        message: error.message,
        details: error.details,
        requestId,
      },
    };
    return Response.json(response, { status: error.statusCode });
  }

  // Prisma errors
  if (error && typeof error === "object" && "code" in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaError = error as any;

    // Unique constraint violation
    if (prismaError.code === "P2002") {
      const response: ErrorResponse = {
        success: false,
        error: {
          code: "UNIQUE_CONSTRAINT_VIOLATION",
          message: "Resource already exists",
          details: prismaError.meta,
          requestId,
        },
      };
      return Response.json(response, { status: 409 });
    }

    // Record not found
    if (prismaError.code === "P2025") {
      const response: ErrorResponse = {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Resource not found",
          requestId,
        },
      };
      return Response.json(response, { status: 404 });
    }
  }

  // Generic errors
  const genericError = error as Error;
  const response: ErrorResponse = {
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred"
          : genericError.message || "Unknown error",
      requestId,
    },
  };

  return Response.json(response, { status: 500 });
}

/**
 * Assert condition or throw error
 */
export function assert(condition: boolean, error: ApiError): asserts condition {
  if (!condition) {
    throw error;
  }
}

/**
 * Create error response
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  code?: string,
  details?: unknown,
  requestId?: string
): Response {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: code || "ERROR",
      message,
      details,
      requestId,
    },
  };
  return Response.json(response, { status: statusCode });
}
