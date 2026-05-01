/**
 * @fileoverview Workspace service — authorization at workspace scope.
 */

import { workspaceRepository } from "./workspace.repository";
import { Role } from "@/lib/constants";
import { ApiErrors } from "@/lib/middlewares";
import type { CreateWorkspaceInput } from "./workspace.schema";

async function assertWorkspaceAdmin(workspaceId: string, userId: string) {
  const m = await workspaceRepository.findMembership(workspaceId, userId);
  if (!m || (m.role !== Role.OWNER && m.role !== Role.ADMIN)) {
    throw ApiErrors.Forbidden("Workspace admin or owner required");
  }
}

export const workspaceService = {
  async listForUser(userId: string) {
    return workspaceRepository.findForUser(userId);
  },

  async getById(workspaceId: string, userId: string) {
    const m = await workspaceRepository.findMembership(workspaceId, userId);
    if (!m) throw ApiErrors.Forbidden("Not a workspace member");
    const ws = await workspaceRepository.findById(workspaceId);
    if (!ws) throw ApiErrors.NotFound("Workspace not found");
    return ws;
  },

  async create(data: CreateWorkspaceInput, ownerId: string) {
    return workspaceRepository.create(data.name, ownerId);
  },

  async removeMember(memberId: string, actorId: string) {
    const row = await workspaceRepository.findMemberById(memberId);
    if (!row) throw ApiErrors.NotFound("Member not found");
    if (row.role === Role.OWNER) throw ApiErrors.BadRequest("Cannot remove workspace owner membership");
    if (row.userId === actorId) {
      await workspaceRepository.deleteMember(memberId);
      return;
    }
    await assertWorkspaceAdmin(row.workspaceId, actorId);
    await workspaceRepository.deleteMember(memberId);
  },
};
