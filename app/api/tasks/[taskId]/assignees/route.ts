import type { NextRequest } from "next/server";
import { assigneeService } from "@/src/modules/assignees/assignee.service";
import { withMiddleware, successResponse, createdResponse, noContentResponse } from "@/lib/http";
import { assertProjectMember, assertProjectContributor } from "@/lib/auth-helpers";
import { ApiErrors } from "@/lib/middlewares";
import { db } from "@/lib/db";
import { z } from "zod";

type Params = { params: Promise<{ taskId: string }> };

const assigneeBodySchema = z.object({ userId: z.string().min(1, "userId is required") });

async function getTaskAndVerifyRead(taskId: string, userId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw ApiErrors.NotFound("Task not found");
  await assertProjectMember(task.projectId, userId);
  return task;
}

async function getTaskAndVerifyWrite(taskId: string, userId: string) {
  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw ApiErrors.NotFound("Task not found");
  await assertProjectContributor(task.projectId, userId);
  return task;
}

export function GET(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { taskId } = await params;
      await getTaskAndVerifyRead(taskId, String(context.user!.id));
      const assignees = await assigneeService.getAssigneesForTask(taskId);
      return successResponse(assignees);
    },
    { auth: true }
  )(req);
}

export function POST(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { taskId } = await params;
      const task = await getTaskAndVerifyWrite(taskId, String(context.user!.id));
      const body = assigneeBodySchema.parse((_r as any).__validatedBody);
      const result = await assigneeService.addAssignee(taskId, body.userId, task.projectId);
      if ("error" in result) throw ApiErrors.BadRequest("User is not a project member");
      return createdResponse(result.data);
    },
    { auth: true, validateBody: assigneeBodySchema }
  )(req);
}

export function DELETE(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (r, context) => {
      const { taskId } = await params;
      await getTaskAndVerifyWrite(taskId, String(context.user!.id));
      const body = assigneeBodySchema.parse(await r.json());
      await assigneeService.removeAssignee(taskId, body.userId);
      return noContentResponse();
    },
    { auth: true }
  )(req);
}
