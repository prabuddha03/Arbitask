import { db } from "@/lib/db";
import { Role } from "@/lib/constants";

export const workspaceRepository = {
  async findById(workspaceId: string) {
    return db.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        teams: { select: { id: true, name: true, parentTeamId: true } },
      },
    });
  },

  async findForUser(userId: string) {
    return db.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        teams: { select: { id: true, name: true, parentTeamId: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async create(name: string, ownerId: string) {
    return db.workspace.create({
      data: {
        name,
        ownerId,
        members: { create: [{ userId: ownerId, role: Role.OWNER }] },
      },
      include: {
        teams: { select: { id: true, name: true, parentTeamId: true } },
      },
    });
  },

  async findMembership(workspaceId: string, userId: string) {
    return db.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  },

  async addMember(workspaceId: string, userId: string, role: string) {
    return db.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId, userId } },
      create: { workspaceId, userId, role },
      update: { role },
    });
  },

  async deleteMember(memberId: string) {
    return db.workspaceMember.delete({ where: { id: memberId } });
  },

  async findMemberById(memberId: string) {
    return db.workspaceMember.findUnique({ where: { id: memberId } });
  },
};
