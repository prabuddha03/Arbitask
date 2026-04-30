/**
 * @fileoverview Member Zod validation schemas
 */

import { z } from "zod";

export const memberQuerySchema = z.object({
  projectId: z.string().min(1, "projectId is required"),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(["ADMIN", "MEMBER", "VIEWER"]),
});

export type MemberQueryParams = z.infer<typeof memberQuerySchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
