/**
 * @fileoverview Pagination utilities
 */

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Calculate skip and take for database queries
 */
export function getPaginationParams(page: number, limit: number): { skip: number; take: number } {
  const safeLimit = Math.min(Math.max(limit, 1), 100); // Min 1, Max 100
  const safePage = Math.max(page, 1);

  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

/**
 * Build pagination result
 */
export function buildPaginationResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginationResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}

/**
 * Parse pagination from query params
 */
export function parsePaginationQuery(query: URLSearchParams): PaginationParams {
  const page = parseInt(query.get("page") || "1", 10);
  const limit = parseInt(query.get("limit") || "20", 10);

  return {
    page: Math.max(page, 1),
    limit: Math.min(Math.max(limit, 1), 100),
  };
}

/**
 * Get page range for pagination UI
 */
export function getPageRange(
  currentPage: number,
  totalPages: number,
  maxPages: number = 5
): number[] {
  const pages: number[] = [];
  const half = Math.floor(maxPages / 2);

  let start = Math.max(1, currentPage - half);
  let end = Math.min(totalPages, currentPage + half);

  // Adjust if at the beginning or end
  if (currentPage <= half) {
    end = Math.min(maxPages, totalPages);
  } else if (currentPage + half >= totalPages) {
    start = Math.max(1, totalPages - maxPages + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
}
