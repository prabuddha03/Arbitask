/**
 * @fileoverview Validation utilities and middleware
 *
 * Provides Zod-based validation for request body, query params, and route params
 */

import { z } from "zod";

// ============================================
// Core Validation Functions
// ============================================

/**
 * Validate data against Zod schema (throws on error)
 */
export function validate<T>(schema: z.Schema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safe validation that returns success/error result (doesn't throw)
 */
export function validateSafe<T>(
  schema: z.Schema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

/**
 * Format Zod validation errors for API response
 */
export function formatValidationErrors(error: z.ZodError<unknown>): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  error.issues.forEach((err: z.ZodIssue) => {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });

  return formatted;
}

// ============================================
// Custom Error Class
// ============================================

/**
 * Custom validation error class
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public errors: Record<string, string[]>
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

// ============================================
// Request-Specific Validation Functions
// ============================================

/**
 * Validate request body
 */
export async function validateRequestBody<T>(req: Request, schema: z.Schema<T>): Promise<T> {
  try {
    const body = await req.json();
    return validate(schema, body);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", formatValidationErrors(error));
    }
    throw new ValidationError("Invalid request body", {
      body: ["Request body must be valid JSON"],
    });
  }
}

/**
 * Validate query parameters
 */
export function validateQueryParams<T>(req: Request, schema: z.Schema<T>): T {
  const url = new URL(req.url);
  const queryObject: Record<string, string> = {};

  url.searchParams.forEach((value, key) => {
    queryObject[key] = value;
  });

  try {
    return validate(schema, queryObject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Query validation failed", formatValidationErrors(error));
    }
    throw error;
  }
}

/**
 * Validate route parameters
 */
export function validateRouteParams<T>(params: unknown, schema: z.Schema<T>): T {
  try {
    return validate(schema, params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Parameter validation failed", formatValidationErrors(error));
    }
    throw error;
  }
}

/**
 * Safe validation wrapper for request body (doesn't throw)
 */
export async function validateRequestBodySafe<T>(
  req: Request,
  schema: z.Schema<T>
): Promise<{ success: true; data: T } | { success: false; errors: z.ZodError }> {
  try {
    const body = await req.json();
    return validateSafe(schema, body);
  } catch (error) {
    return {
      success: false,
      errors: new z.ZodError([
        {
          code: "custom",
          path: ["body"],
          message: "Invalid request body",
        },
      ]),
    };
  }
}
