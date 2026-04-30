/**
 * @fileoverview Assignee Repository — database queries for task assignees
 */

import { db } from "@/lib/db";

const userSelect = { id: true, name: true, image: true };

export const assigneeRepository = {
  async findByTask(taskId: string) {
    return db.taskAssignee.findMany({
      where: { taskId },
      include: { user: { select: userSelect } },
    });
  },

  async upsert(taskId: string, userId: string) {
    return db.taskAssignee.upsert({
      where: { taskId_userId: { taskId, userId } },
      create: { taskId, userId },
      update: {},
      include: { user: { select: userSelect } },
    });
  },

  async removeByTaskAndUser(taskId: string, userId: string) {
    return db.taskAssignee.deleteMany({ where: { taskId, userId } });
  },
};
