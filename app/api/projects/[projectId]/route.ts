import type { NextRequest } from "next/server";
import { projectService } from "@/src/modules/projects/project.service";
import { updateProjectSchema } from "@/src/modules/projects/project.schema";
import { withMiddleware, successResponse, noContentResponse } from "@/lib/http";
import { assertProjectAdmin } from "@/lib/auth-helpers";
import { Role } from "@/lib/constants";
import { db } from "@/lib/db";
import { ApiErrors } from "@/lib/middlewares";
import { validateRequestBody } from "@/lib/validation/validation";

type Params = { params: Promise<{ projectId: string }> };

/**
 * @openapi
 * /api/projects/{projectId}:
 *   patch:
 *     tags: [Projects]
 *     summary: Update a project (ADMIN or OWNER only)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Updated project
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export function PATCH(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (r, context) => {
      const { projectId } = await params;
      await assertProjectAdmin(projectId, String(context.user!.id));
      const validated = updateProjectSchema.parse((r as any).__validatedBody);
      const updated = await projectService.updateProject(projectId, validated);
      return successResponse(updated);
    },
    { auth: true, validateBody: updateProjectSchema }
  )(req);
}

/**
 * @openapi
 * /api/projects/{projectId}:
 *   delete:
 *     tags: [Projects]
 *     summary: Delete a project (OWNER only)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 */
export function DELETE(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { projectId } = await params;
      const member = await db.projectMember.findUnique({
        where: { projectId_userId: { projectId, userId: String(context.user!.id) } },
      });
      if (!member || member.role !== Role.OWNER) throw ApiErrors.Forbidden("Only the project owner can delete");
      await projectService.deleteProject(projectId);
      return noContentResponse();
    },
    { auth: true }
  )(req);
}
