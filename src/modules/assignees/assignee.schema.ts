/**
 * @fileoverview Assignee Zod validation schemas
 */

import { z } from "zod";

export const addAssigneeSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export const removeAssigneeSchema = z.object({
  userId: z.string().min(1, "userId is required"),
});

export type AddAssigneeInput = z.infer<typeof addAssigneeSchema>;
export type RemoveAssigneeInput = z.infer<typeof removeAssigneeSchema>;
