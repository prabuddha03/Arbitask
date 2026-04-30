/**
 * @fileoverview Invite Zod validation schemas
 */

import { z } from "zod";

export const createInviteSchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]).default("MEMBER"),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
