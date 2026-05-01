/**
 * @fileoverview Project Repository — database queries for projects
 */

import { db } from "@/lib/db";

// Standard includes for project queries
const projectIncludes = {
  tasks: {
    include: {
      assignees: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  },
  members: {
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  },
};

export const projectRepository = {
  /**
   * Find all projects where the user is a member
   */
  async findByMembership(userId: string) {
    const memberships = await db.projectMember.findMany({
      where: { userId },
      include: { project: { include: projectIncludes } },
      orderBy: { joinedAt: "asc" },
    });
    return memberships.map((m) => m.project);
  },

  /**
   * Find a single project by ID
   */
  async findById(projectId: string) {
    return db.project.findUnique({
      where: { id: projectId },
      include: projectIncludes,
    });
  },

  /**
   * Create a new project with the owner as a member
   */
  async create(
    data: {
      teamId: string;
      name: string;
      description?: string | null;
      colorId?: string;
      status?: string;
      priority?: string;
      lead?: string | null;
      startDate?: Date | null;
      targetDate?: Date | null;
    },
    ownerId: string,
    ownerRole: string
  ) {
    return db.project.create({
      data: {
        teamId: data.teamId,
        name: data.name,
        description: data.description || null,
        colorId: data.colorId || "rose",
        status: data.status || "backlog",
        priority: data.priority || "no_priority",
        lead: data.lead || null,
        startDate: data.startDate || null,
        targetDate: data.targetDate || null,
        ownerId,
        members: {
          create: { userId: ownerId, role: ownerRole },
        },
      },
      include: {
        tasks: true,
        members: {
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
  },

  /**
   * Update an existing project
   */
  async update(projectId: string, data: Record<string, unknown>) {
    return db.project.update({
      where: { id: projectId },
      data,
    });
  },

  /**
   * Delete a project
   */
  async delete(projectId: string) {
    return db.project.delete({ where: { id: projectId } });
  },
};
