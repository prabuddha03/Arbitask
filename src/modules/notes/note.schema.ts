/**
 * @fileoverview Note Zod validation schemas
 */

import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  content: z.string().max(50000).default(""),
  projectId: z.string().optional().nullable(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
