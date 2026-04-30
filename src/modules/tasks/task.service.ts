/**
 * @fileoverview Task Service — business logic for tasks
 */

import { taskRepository } from "./task.repository";
import type { CreateTaskInput, UpdateTaskInput } from "./task.schema";

export const taskService = {
  async getTaskById(taskId: string) {
    return taskRepository.findById(taskId);
  },

  async createTask(data: CreateTaskInput) {
    return taskRepository.create(data);
  },

  async updateTask(taskId: string, data: UpdateTaskInput) {
    const updateData: Record<string, unknown> = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startDate !== undefined) updateData.startDate = data.startDate || null;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate || null;
    if (data.description !== undefined) updateData.description = data.description;

    return taskRepository.update(taskId, updateData);
  },

  async deleteTask(taskId: string) {
    return taskRepository.delete(taskId);
  },
};
