/**
 * @fileoverview Task Repository — database queries for tasks
 */

import { db } from "@/lib/db";

const taskIncludes = {
  assignees: {
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  },
};

export const taskRepository = {
  async findById(taskId: string) {
    return db.task.findUnique({ where: { id: taskId }, include: taskIncludes });
  },

  async create(data: {
    projectId: string;
    title: string;
    type?: string;
    status?: string;
    startDate?: Date | null;
    dueDate?: Date | null;
    description?: string | null;
  }) {
    return db.task.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        type: data.type || "dev",
        status: data.status || "idea",
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
        description: data.description || null,
      },
      include: taskIncludes,
    });
  },

  async update(taskId: string, data: Record<string, unknown>) {
    return db.task.update({
      where: { id: taskId },
      data,
      include: taskIncludes,
    });
  },

  async delete(taskId: string) {
    return db.task.delete({ where: { id: taskId } });
  },
};
