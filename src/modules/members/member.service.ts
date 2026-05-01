/**
 * @fileoverview Member Service — business logic for project members
 */

import { memberRepository } from "./member.repository";
import { Role } from "@/lib/constants";
import { getEffectiveProjectMember, isAtLeastAdmin } from "@/src/modules/rbac/rbac.service";

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

    const effective = await getEffectiveProjectMember(target.projectId, requestingUserId);
    if (!effective || !isAtLeastAdmin(effective.role)) {
      return { error: "FORBIDDEN" as const };
    }

    await memberRepository.delete(memberId);
    return { success: true };
  },
};
