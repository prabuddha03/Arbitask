/**
 * @fileoverview Assignee Service — business logic for task assignees
 */

import { assigneeRepository } from "./assignee.repository";
import { getEffectiveProjectMember } from "@/src/modules/rbac/rbac.service";

export const assigneeService = {
  async getAssigneesForTask(taskId: string) {
    return assigneeRepository.findByTask(taskId);
  },

  /**
   * Add an assignee to a task.
   * Validates that the target user is a project member.
   */
  async addAssignee(taskId: string, userId: string, projectId: string) {
    const access = await getEffectiveProjectMember(projectId, userId);
    if (!access) return { error: "NOT_A_PROJECT_MEMBER" as const };

    const assignee = await assigneeRepository.upsert(taskId, userId);
    return { data: assignee };
  },

  async removeAssignee(taskId: string, userId: string) {
    await assigneeRepository.removeByTaskAndUser(taskId, userId);
  },
};
