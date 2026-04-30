/**
 * @fileoverview Project Zod validation schemas
 */

import { z } from "zod";

// ============================================
// Create Project Schema
// ============================================
export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or less"),
  description: z.string().max(1000).optional().nullable(),
  colorId: z.string().default("rose"),
  status: z
    .enum(["backlog", "in_progress", "on_track", "at_risk", "completed", "cancelled"])
    .default("backlog"),
  priority: z.enum(["no_priority", "urgent", "high", "medium", "low"]).default("no_priority"),
  lead: z.string().max(100).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  targetDate: z.coerce.date().optional().nullable(),
});

// ============================================
// Update Project Schema
// ============================================
export const updateProjectSchema = createProjectSchema.partial();

// ============================================
// Query Params Schema
// ============================================
export const projectQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["backlog", "in_progress", "on_track", "at_risk", "completed", "cancelled"])
    .optional(),
  priority: z.enum(["no_priority", "urgent", "high", "medium", "low"]).optional(),
});

// ============================================
// Type Exports
// ============================================
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>;
