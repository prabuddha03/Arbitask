/**
 * @fileoverview Standard API response formatters
 */

import { NextResponse } from "next/server";
import {
  toApiResponse,
  toApiResponseList,
  type EntityWithExternalId,
} from "../utils/response-transformer";

// type imports
import { ErrorResponse, BaseSuccessResponse as SuccessResponse } from "@/types/api/common";

/**
 * Create success response
 */
export function successResponse<T>(
  data: T,
  options?: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
    meta?: Record<string, unknown>;
  }
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = {
    success: true,
    data,
    message: options?.message,
    meta: options?.meta,
  };

  return NextResponse.json(response, {
    status: options?.status || 200,
    headers: options?.headers,
  });
}

/**
 * Create error response
 */
export function errorResponse(
  message: string,
  options?: {
    code?: string;
    status?: number;
    details?: unknown;
    requestId?: string;
    headers?: HeadersInit;
  }
): NextResponse<ErrorResponse> {
  const response: ErrorResponse = {
    success: false,
    error: {
      code: options?.code || "ERROR",
      message,
      details: options?.details,
      requestId: options?.requestId,
    },
  };

  return NextResponse.json(response, {
    status: options?.status || 500,
    headers: options?.headers,
  });
}

/**
 * Create paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  },
  options?: {
    message?: string;
    status?: number;
  }
): NextResponse {
  return successResponse(items, {
    message: options?.message,
    status: options?.status,
    meta: { pagination },
  });
}

/**
 * Create created response (201)
 */
export function createdResponse<T>(
  data: T,
  message: string = "Resource created successfully"
): NextResponse<SuccessResponse<T>> {
  return successResponse(data, {
    message,
    status: 201,
  });
}

/**
 * Create no content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Create not found response (404)
 */
export function notFoundResponse(
  message: string = "Resource not found",
  requestId?: string
): NextResponse<ErrorResponse> {
  return errorResponse(message, {
    code: "NOT_FOUND",
    status: 404,
    requestId,
  });
}

/**
 * Create unauthorized response (401)
 */
export function unauthorizedResponse(
  message: string = "Unauthorized",
  requestId?: string
): NextResponse<ErrorResponse> {
  return errorResponse(message, {
    code: "UNAUTHORIZED",
    status: 401,
    requestId,
  });
}

/**
 * Create forbidden response (403)
 */
export function forbiddenResponse(
  message: string = "Forbidden",
  requestId?: string
): NextResponse<ErrorResponse> {
  return errorResponse(message, {
    code: "FORBIDDEN",
    status: 403,
    requestId,
  });
}

// ============================================
// Auto-Transform Response Helpers
// ============================================

/**
 * Create success response with automatic entity transformation
 * Automatically hides internal ID and exposes externalId as id
 */
export function entityResponse<T extends EntityWithExternalId>(
  entity: T,
  options?: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
    meta?: Record<string, unknown>;
  }
) {
  const transformed = toApiResponse(entity);
  return successResponse(transformed, options);
}

/**
 * Create success response for entity list with automatic transformation
 */
export function entityListResponse<T extends EntityWithExternalId>(
  entities: T[],
  options?: {
    message?: string;
    status?: number;
    headers?: HeadersInit;
    meta?: Record<string, unknown>;
  }
) {
  const transformed = toApiResponseList(entities);
  return successResponse(transformed, options);
}

/**
 * Create created response (201) with automatic entity transformation
 */
export function entityCreatedResponse<T extends EntityWithExternalId>(
  entity: T,
  message: string = "Resource created successfully"
) {
  const transformed = toApiResponse(entity);
  return successResponse(transformed, {
    message,
    status: 201,
  });
}
