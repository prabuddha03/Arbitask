/**
 * @fileoverview Invite Repository — database queries for invites
 */

import { db } from "@/lib/db";

export const inviteRepository = {
  async findByToken(token: string) {
    return db.invite.findUnique({
      where: { token },
      include: { project: { select: { id: true, name: true, colorId: true } } },
    });
  },

  async create(data: { projectId: string; senderId: string; role: string; expiresAt: Date }) {
    return db.invite.create({ data });
  },

  async updateStatus(token: string, status: string) {
    return db.invite.update({ where: { token }, data: { status } });
  },
};
