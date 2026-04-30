import type { NextRequest } from "next/server";
import { taskService } from "@/src/modules/tasks/task.service";
import { createTaskSchema } from "@/src/modules/tasks/task.schema";
import { withMiddleware, createdResponse } from "@/lib/http";
import { assertProjectMember } from "@/lib/auth-helpers";
import { ApiErrors } from "@/lib/middlewares";

/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a task
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *     responses:
 *       201:
 *         description: Created task
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export function POST(req: NextRequest) {
  return withMiddleware(
    async (_r, context) => {
      const validated = createTaskSchema.parse((_r as any).__validatedBody);
      await assertProjectMember(validated.projectId, String(context.user!.id));
      
      const task = await taskService.createTask(validated);
      return createdResponse(task);
    },
    { auth: true, validateBody: createTaskSchema }
  )(req);
}
