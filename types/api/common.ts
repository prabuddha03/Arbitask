/**
 * @fileoverview Common API response types for Arbitask
 *
 * These types define the standard response envelopes used across all API endpoints.
 */

export interface BaseSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

export interface PaginatedSuccessResponse<T = unknown> extends BaseSuccessResponse<T[]> {
  meta: { pagination: PaginationMeta };
}
