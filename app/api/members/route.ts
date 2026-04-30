import type { NextRequest } from "next/server";
import { memberService } from "@/src/modules/members/member.service";
import { withMiddleware, successResponse } from "@/lib/http";
import { assertProjectMember } from "@/lib/auth-helpers";
import { ApiErrors } from "@/lib/middlewares";

/**
 * @openapi
 * /api/members:
 *   get:
 *     tags: [Members]
 *     summary: List project members
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of project members
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export function GET(req: NextRequest) {
  return withMiddleware(
    async (r, context) => {
      const projectId = r.nextUrl.searchParams.get("projectId");
      if (!projectId) throw ApiErrors.BadRequest("projectId query param is required");
      await assertProjectMember(projectId, String(context.user!.id));
      
      const members = await memberService.getMembersForProject(projectId);
      return successResponse(members);
    },
    { auth: true }
  )(req);
}
