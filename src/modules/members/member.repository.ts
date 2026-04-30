/**
 * @fileoverview Member Repository — database queries for project members
 */

import { db } from "@/lib/db";

export const memberRepository = {
  async findByProject(projectId: string) {
    return db.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
      orderBy: { joinedAt: "asc" },
    });
  },

  async findById(memberId: string) {
    return db.projectMember.findUnique({ where: { id: memberId } });
  },

  async findMembership(projectId: string, userId: string) {
    return db.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  },

  async delete(memberId: string) {
    return db.projectMember.delete({ where: { id: memberId } });
  },
};
