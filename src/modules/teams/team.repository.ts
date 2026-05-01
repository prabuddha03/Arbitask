import { db } from "@/lib/db";

export const teamRepository = {
  async findById(teamId: string) {
    return db.team.findUnique({
      where: { id: teamId },
      include: {
        workspace: { select: { id: true, name: true, ownerId: true } },
        members: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
        children: { select: { id: true, name: true } },
      },
    });
  },

  async listByWorkspace(workspaceId: string) {
    return db.team.findMany({
      where: { workspaceId },
      include: {
        _count: { select: { projects: true, members: true, children: true } },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async listForUser(userId: string) {
    return db.team.findMany({
      where: { members: { some: { userId } } },
      include: {
        workspace: { select: { id: true, name: true } },
        members: { where: { userId }, take: 1 },
      },
      orderBy: [{ workspaceId: "asc" }, { name: "asc" }],
    });
  },

  async create(data: {
    workspaceId: string;
    name: string;
    description?: string | null;
    parentTeamId?: string | null;
  }) {
    return db.team.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        description: data.description ?? null,
        parentTeamId: data.parentTeamId ?? null,
      },
    });
  },

  async update(teamId: string, data: { name?: string; description?: string | null; parentTeamId?: string | null }) {
    return db.team.update({ where: { id: teamId }, data });
  },

  async delete(teamId: string) {
    return db.team.delete({ where: { id: teamId } });
  },

  async findMembership(teamId: string, userId: string) {
    return db.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
  },

  async addMember(teamId: string, userId: string, role: string) {
    return db.teamMember.create({
      data: { teamId, userId, role },
    });
  },

  async upsertMember(teamId: string, userId: string, role: string) {
    return db.teamMember.upsert({
      where: { teamId_userId: { teamId, userId } },
      create: { teamId, userId, role },
      update: { role },
    });
  },

  async updateMemberRole(memberId: string, role: string) {
    return db.teamMember.update({ where: { id: memberId }, data: { role } });
  },

  async deleteMember(memberId: string) {
    return db.teamMember.delete({ where: { id: memberId } });
  },

  async findMemberById(memberId: string) {
    return db.teamMember.findUnique({ where: { id: memberId } });
  },

  async countProjects(teamId: string) {
    return db.project.count({ where: { teamId } });
  },
};
