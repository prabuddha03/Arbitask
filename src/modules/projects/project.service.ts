/**
 * @fileoverview Project Service — business logic for projects
 */

import { projectRepository } from "./project.repository";
import { teamRepository } from "@/src/modules/teams/team.repository";
import { teamService } from "@/src/modules/teams/team.service";
import { Role } from "@/lib/constants";
import { ApiErrors } from "@/lib/middlewares";
import { isAtLeastMember } from "@/src/modules/rbac/rbac.service";
import type { CreateProjectInput, UpdateProjectInput } from "./project.schema";

export const projectService = {
  /**
   * Get all projects the user has access to
   */
  async getProjectsForUser(userId: string) {
    await teamService.ensureBackfill();
    return projectRepository.findByMembership(userId);
  },

  /**
   * Get a single project by ID
   */
  async getProjectById(projectId: string) {
    return projectRepository.findById(projectId);
  },

  /**
   * Create a project under a team; creator must be MEMBER+ on the team.
   */
  async createProject(data: CreateProjectInput, ownerId: string) {
    await teamService.ensureBackfill();
    const tm = await teamRepository.findMembership(data.teamId, ownerId);
    if (!tm || !isAtLeastMember(tm.role)) {
      throw ApiErrors.Forbidden("You need Member access or higher on the team to create a project");
    }
    return projectRepository.create(data, ownerId, Role.OWNER);
  },

  /**
   * Update an existing project
   * Caller must verify admin/owner permissions before calling
   */
  async updateProject(projectId: string, data: UpdateProjectInput) {
    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.colorId !== undefined) updateData.colorId = data.colorId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.lead !== undefined) updateData.lead = data.lead || null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate || null;

    return projectRepository.update(projectId, updateData);
  },

  /**
   * Delete a project
   * Caller must verify owner permissions before calling
   */
  async deleteProject(projectId: string) {
    return projectRepository.delete(projectId);
  },
};
