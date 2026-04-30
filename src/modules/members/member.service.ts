/**
 * @fileoverview Member Service — business logic for project members
 */

import { memberRepository } from "./member.repository";
import { Role } from "@/lib/constants";

export const memberService = {
  async getMembersForProject(projectId: string) {
    return memberRepository.findByProject(projectId);
  },

  /**
   * Remove a member from a project.
   * - Cannot remove the OWNER.
   * - User can remove themselves.
   * - Admins/Owners can remove others.
   */
  async removeMember(memberId: string, requestingUserId: string) {
    const target = await memberRepository.findById(memberId);
    if (!target) return { error: "NOT_FOUND" as const };

    if (target.role === Role.OWNER) return { error: "CANNOT_REMOVE_OWNER" as const };

    // Allow self-removal
    if (target.userId === requestingUserId) {
      await memberRepository.delete(memberId);
      return { success: true };
    }

    // Otherwise, check admin permission
    const requestingMember = await memberRepository.findMembership(
      target.projectId,
      requestingUserId
    );
    if (
      !requestingMember ||
      (requestingMember.role !== Role.OWNER && requestingMember.role !== Role.ADMIN)
    ) {
      return { error: "FORBIDDEN" as const };
    }

    await memberRepository.delete(memberId);
    return { success: true };
  },
};
