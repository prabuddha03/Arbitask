/**
 * @fileoverview Common validation schemas shared across domains
 */

import { z } from "zod";

/**
 * Email validation
 */
export const emailSchema = z.string().email("Invalid email address").toLowerCase();

/**
 * Phone validation (international format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format")
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number must not exceed 15 digits");

/**
 * Normalize a phone number to E.164 format.
 * - Strips non-digit characters (except leading +)
 * - Prepends +91 for bare 10-digit Indian numbers
 * - Prepends + if missing on longer numbers
 */
export function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[^\d+]/g, "");

  if (!normalized.startsWith("+")) {
    if (normalized.length === 10) {
      normalized = "+91" + normalized;
    } else {
      normalized = "+" + normalized;
    }
  }

  return normalized;
}

/**
 * Zod schema that accepts a phone number in any format and normalizes it to E.164.
 * Accepts: "9830822490", "+919830822490", "91 9830822490", etc.
 * Output is always E.164 (e.g. "+919830822490").
 */
export const normalizedPhoneSchema = z
  .string()
  .min(10, "Phone number must be at least 10 digits")
  .max(16, "Phone number is too long")
  .transform(normalizePhone)
  .pipe(
    z.string().regex(/^\+[1-9]\d{6,14}$/, "Invalid phone number after normalization")
  );

/**
 * URL validation
 */
export const urlSchema = z.string().url("Invalid URL format");

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Date range schema
 */
export const dateRangeSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

/**
 * Slug validation
 */
export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format")
  .min(3, "Slug must be at least 3 characters")
  .max(100, "Slug must not exceed 100 characters");

/**
 * Password validation
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

/**
 * Username validation
 */
export const usernameSchema = z
  .string()
  .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores, and hyphens")
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username must not exceed 30 characters");

/**
 * OTP validation
 */
export const otpSchema = z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits");

/**
 * Color hex code validation
 */
export const hexColorSchema = z
  .string()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color format");

/**
 * File size validation (in bytes)
 */
export function fileSizeSchema(maxSizeInMB: number) {
  return z.number().max(maxSizeInMB * 1024 * 1024, `File size must not exceed ${maxSizeInMB}MB`);
}

/**
 * Image file type validation
 */
export const imageFileTypeSchema = z.enum([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/**
 * Coordinates validation
 */
export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/**
 * Sort order schema
 */
export const sortOrderSchema = z.enum(["asc", "desc"]);

/**
 * Search query schema
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, "Search query cannot be empty").max(100),
  ...paginationSchema.shape,
});

/**
 * ID parameter schema (for route params)
 */
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * Timestamp schema
 */
export const timestampSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

/**
 * Language enum schema
 */
export const languageSchema = z.enum(["ENGLISH", "BENGALI", "HINDI"]);

/**
 * Status schema (generic)
 */
export const statusSchema = z.enum(["active", "inactive", "pending"]);

/**
 * Rating schema (1-5)
 */
export const ratingSchema = z.number().int().min(1).max(5);

/**
 * Price schema (positive decimal)
 */
export const priceSchema = z.number().positive("Price must be greater than 0");

/**
 * Quantity schema (positive integer)
 */
export const quantitySchema = z.number().int().positive("Quantity must be greater than 0");

/**
 * Boolean string schema (for query params)
 */
export const booleanStringSchema = z
  .string()
  .transform((val) => val === "true" || val === "1")
  .pipe(z.boolean());
