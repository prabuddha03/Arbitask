/**
 * @fileoverview HTTP utility functions
 */

import { NextRequest } from "next/server";

/**
 * Parse JSON body safely
 */
export async function parseJsonBody<T = any>(req: NextRequest): Promise<T | null> {
  try {
    return await req.json();
  } catch (error) {
    return null;
  }
}

/**
 * Get query parameter
 */
export function getQueryParam(req: NextRequest, key: string): string | null {
  const { searchParams } = new URL(req.url);
  return searchParams.get(key);
}

/**
 * Get all query parameters
 */
export function getQueryParams(req: NextRequest): Record<string, string> {
  const { searchParams } = new URL(req.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Get header value
 */
export function getHeader(req: NextRequest, key: string): string | null {
  return req.headers.get(key);
}

/**
 * Check if request is JSON
 */
export function isJsonRequest(req: NextRequest): boolean {
  const contentType = req.headers.get("content-type");
  return contentType?.includes("application/json") || false;
}

/**
 * Get base URL from request
 */
export function getBaseUrl(req: NextRequest): string {
  const url = new URL(req.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Build full URL from path
 */
export function buildUrl(req: NextRequest, path: string): string {
  const baseUrl = getBaseUrl(req);
  return `${baseUrl}${path}`;
}
