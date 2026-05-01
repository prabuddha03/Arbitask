/**
 * @fileoverview Team service — hierarchy, membership, authorization.
 */

import { db } from "@/lib/db";
import { teamRepository } from "./team.repository";
import { workspaceRepository } from "@/src/modules/workspaces/workspace.repository";
import { ensureTeamHierarchyBackfill } from "./team-backfill";
import { Role } from "@/lib/constants";
import { ApiErrors } from "@/lib/middlewares";
import type { CreateTeamInput, UpdateTeamInput, AddTeamMemberInput, UpdateTeamMemberInput } from "./team.schema";

async function assertTeamAdmin(teamId: string, userId: string) {
  const m = await teamRepository.findMembership(teamId, userId);
  if (!m || (m.role !== Role.OWNER && m.role !== Role.ADMIN)) {
    throw ApiErrors.Forbidden("Team admin or owner required");
  }
}

async function assertUserInWorkspaceForTeam(teamId: string, targetUserId: string): Promise<void> {
  const team = await db.team.findUnique({
    where: { id: teamId },
    select: { workspaceId: true },
  });
  if (!team) throw ApiErrors.NotFound("Team not found");
  const wm = await workspaceRepository.findMembership(team.workspaceId, targetUserId);
  if (!wm) throw ApiErrors.BadRequest("User must be a workspace member before joining a team");
}

export const teamService = {
  async ensureBackfill() {
    await ensureTeamHierarchyBackfill();
  },

  async listTeamsForProjectCreation(userId: string) {
    await ensureTeamHierarchyBackfill();
    const teams = await teamRepository.listForUser(userId);
    return teams.filter((t) => {
      const r = t.members[0]?.role;
      return r === Role.OWNER || r === Role.ADMIN || r === Role.MEMBER;
    });
  },

  async listByWorkspace(workspaceId: string, userId: string) {
    await ensureTeamHierarchyBackfill();
    const wm = await workspaceRepository.findMembership(workspaceId, userId);
    if (!wm) throw ApiErrors.Forbidden("Not a workspace member");
    return teamRepository.listByWorkspace(workspaceId);
  },

  async getById(teamId: string, userId: string) {
    await ensureTeamHierarchyBackfill();
    const m = await teamRepository.findMembership(teamId, userId);
    if (!m) throw ApiErrors.Forbidden("Not a team member");
    const team = await teamRepository.findById(teamId);
    if (!team) throw ApiErrors.NotFound("Team not found");
    return team;
  },

  async create(data: CreateTeamInput, actorId: string) {
    await ensureTeamHierarchyBackfill();
    const wm = await workspaceRepository.findMembership(data.workspaceId, actorId);
    if (!wm || (wm.role !== Role.OWNER && wm.role !== Role.ADMIN)) {
      throw ApiErrors.Forbidden("Workspace admin or owner required to create teams");
    }
    if (data.parentTeamId) {
      const parent = await db.team.findUnique({
        where: { id: data.parentTeamId },
        select: { workspaceId: true },
      });
      if (!parent || parent.workspaceId !== data.workspaceId) {
        throw ApiErrors.BadRequest("parentTeamId must belong to the same workspace");
      }
    }
    const team = await teamRepository.create({
      workspaceId: data.workspaceId,
      name: data.name,
      description: data.description,
      parentTeamId: data.parentTeamId,
    });
    await teamRepository.addMember(team.id, actorId, Role.OWNER);
    return teamRepository.findById(team.id);
  },

  async update(teamId: string, data: UpdateTeamInput, actorId: string) {
    await assertTeamAdmin(teamId, actorId);
    const patch: { name?: string; description?: string | null; parentTeamId?: string | null } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.description !== undefined) patch.description = data.description;
    if (data.parentTeamId !== undefined) patch.parentTeamId = data.parentTeamId;
    await teamRepository.update(teamId, patch);
    return teamRepository.findById(teamId);
  },

  async delete(teamId: string, actorId: string) {
    await assertTeamAdmin(teamId, actorId);
    const n = await teamRepository.countProjects(teamId);
    if (n > 0) throw ApiErrors.BadRequest("Remove or move projects before deleting the team");
    const children = await db.team.count({ where: { parentTeamId: teamId } });
    if (children > 0) throw ApiErrors.BadRequest("Delete or reassign child teams first");
    await teamRepository.delete(teamId);
  },

  async addMember(teamId: string, input: AddTeamMemberInput, actorId: string) {
    await assertTeamAdmin(teamId, actorId);
    await assertUserInWorkspaceForTeam(teamId, input.userId);
    return teamRepository.upsertMember(teamId, input.userId, input.role);
  },

  async updateMemberRole(teamId: string, memberId: string, data: UpdateTeamMemberInput, actorId: string) {
    await assertTeamAdmin(teamId, actorId);
    const row = await teamRepository.findMemberById(memberId);
    if (!row || row.teamId !== teamId) throw ApiErrors.NotFound("Team member not found");
    if (row.role === Role.OWNER) throw ApiErrors.BadRequest("Cannot change team owner role here");
    return teamRepository.updateMemberRole(memberId, data.role);
  },

  async removeMember(teamId: string, memberId: string, actorId: string) {
    const row = await teamRepository.findMemberById(memberId);
    if (!row || row.teamId !== teamId) throw ApiErrors.NotFound("Team member not found");
    if (row.role === Role.OWNER) throw ApiErrors.BadRequest("Cannot remove the team owner");

    if (row.userId === actorId) {
      await teamRepository.deleteMember(memberId);
      return;
    }
    await assertTeamAdmin(teamId, actorId);
    await teamRepository.deleteMember(memberId);
  },
};
