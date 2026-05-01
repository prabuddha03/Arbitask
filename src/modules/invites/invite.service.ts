/**
 * @fileoverview Invite Service — business logic for project invites
 */

import { inviteRepository } from "./invite.repository";
import { memberRepository } from "@/src/modules/members/member.repository";
import { teamService } from "@/src/modules/teams/team.service";
import { InviteStatus, Role } from "@/lib/constants";
import type { CreateInviteInput } from "./invite.schema";

export const inviteService = {
  /**
   * Generate a new invite link (valid for 7 days)
   * Caller must verify admin permissions before calling
   */
  async createInvite(data: CreateInviteInput, senderId: string) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await inviteRepository.create({
      projectId: data.projectId,
      senderId,
      role: data.role,
      expiresAt,
    });

    return { token: invite.token };
  },

  /**
   * Get invite details by token (for the accept page)
   */
  async getInviteByToken(token: string) {
    const invite = await inviteRepository.findByToken(token);

    if (!invite) return { error: "INVALID_INVITE" as const };
    if (invite.status !== InviteStatus.PENDING || invite.expiresAt < new Date()) {
      return { error: "EXPIRED" as const };
    }

    return {
      data: {
        projectId: invite.projectId,
        projectName: invite.project.name,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    };
  },

  /**
   * Accept an invite — adds user as a project member
   */
  async acceptInvite(token: string, userId: string) {
    const invite = await inviteRepository.findByToken(token);

    if (!invite) return { error: "INVALID_INVITE" as const };
    if (invite.status !== InviteStatus.PENDING || invite.expiresAt < new Date()) {
      return { error: "EXPIRED" as const };
    }

    await teamService.ensureBackfill();

    const existing = await memberRepository.findMembership(invite.projectId, userId);
    if (!existing) {
      const { db } = await import("@/lib/db");
      await db.projectMember.create({
        data: { projectId: invite.projectId, userId, role: invite.role },
      });

      const project = await db.project.findUnique({
        where: { id: invite.projectId },
        select: { teamId: true },
      });
      if (project?.teamId) {
        const team = await db.team.findUnique({
          where: { id: project.teamId },
          select: { workspaceId: true },
        });
        if (team) {
          await db.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: team.workspaceId, userId } },
            create: { workspaceId: team.workspaceId, userId, role: Role.MEMBER },
            update: {},
          });
          await db.teamMember.upsert({
            where: { teamId_userId: { teamId: project.teamId, userId } },
            create: { teamId: project.teamId, userId, role: invite.role },
            update: { role: invite.role },
          });
        }
      }
    }

    // Mark invite as accepted
    await inviteRepository.updateStatus(token, InviteStatus.ACCEPTED);

    return { data: { projectId: invite.projectId } };
  },
};
