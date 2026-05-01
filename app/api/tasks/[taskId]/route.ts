import type { NextRequest } from "next/server";
import { taskService } from "@/src/modules/tasks/task.service";
import { updateTaskSchema } from "@/src/modules/tasks/task.schema";
import { withMiddleware, successResponse, noContentResponse } from "@/lib/http";
import { assertProjectContributor } from "@/lib/auth-helpers";
import { ApiErrors } from "@/lib/middlewares";
import { db } from "@/lib/db";

type Params = { params: Promise<{ taskId: string }> };

async function getTaskAndVerifyMember(taskId: string, userId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw ApiErrors.NotFound("Task not found");
  await assertProjectContributor(task.projectId, userId);
  
  return task;
}

/**
 * @openapi
 * /api/tasks/{taskId}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *     responses:
 *       200:
 *         description: Updated task
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export function PATCH(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { taskId } = await params;
      await getTaskAndVerifyMember(taskId, String(context.user!.id));
      const validated = updateTaskSchema.parse((_r as any).__validatedBody);
      const updated = await taskService.updateTask(taskId, validated);
      return successResponse(updated);
    },
    { auth: true, validateBody: updateTaskSchema }
  )(req);
}

/**
 * @openapi
 * /api/tasks/{taskId}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export function DELETE(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { taskId } = await params;
      await getTaskAndVerifyMember(taskId, String(context.user!.id));
      await taskService.deleteTask(taskId);
      return noContentResponse();
    },
    { auth: true }
  )(req);
}
