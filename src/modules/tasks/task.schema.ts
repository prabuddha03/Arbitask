/**
 * @fileoverview Task Zod validation schemas
 */

import { z } from "zod";

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  title: z.string().min(1, "Title is required").max(200),
  type: z.enum(["design", "dev", "research", "content", "marketing", "other"]).default("dev"),
  status: z.enum(["idea", "planned", "in_progress", "blocked", "done", "archived"]).default("idea"),
  startDate: z.coerce.date().optional().nullable(),
  dueDate: z.coerce.date().optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.omit({ projectId: true }).partial();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
