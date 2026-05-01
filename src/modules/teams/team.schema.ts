import { z } from "zod";
import { Role } from "@/lib/constants";

const roleEnum = z.enum([Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER]);

export const createTeamSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(120),
  description: z.string().max(2000).optional().nullable(),
  parentTeamId: z.string().min(1).optional().nullable(),
});

export const updateTeamSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  parentTeamId: z.string().min(1).nullable().optional(),
});

export const addTeamMemberSchema = z.object({
  userId: z.string().min(1),
  role: roleEnum.default(Role.MEMBER),
});

export const updateTeamMemberSchema = z.object({
  role: roleEnum,
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;
export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
