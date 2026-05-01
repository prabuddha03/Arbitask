import { z } from "zod";
import { Role } from "@/lib/constants";

const roleEnum = z.enum([Role.OWNER, Role.ADMIN, Role.MEMBER, Role.VIEWER]);

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
});

export const addWorkspaceMemberSchema = z.object({
  userId: z.string().min(1),
  role: roleEnum.default(Role.MEMBER),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type AddWorkspaceMemberInput = z.infer<typeof addWorkspaceMemberSchema>;
