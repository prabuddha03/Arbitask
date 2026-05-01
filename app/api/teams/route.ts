import type { NextRequest } from "next/server";
import { createGetHandler, createPostHandler } from "@/lib/factories";
import { teamService } from "@/src/modules/teams/team.service";
import { createTeamSchema } from "@/src/modules/teams/team.schema";

/**
 * @openapi
 * /api/teams:
 *   get:
 *     tags: [Teams]
 *     summary: List teams
 *     description: Without workspaceId, returns teams where you have Member+ (for creating projects). With workspaceId, lists teams in that workspace.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: workspaceId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Teams
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const GET = createGetHandler(async (req: NextRequest, context) => {
  const workspaceId = req.nextUrl.searchParams.get("workspaceId");
  const userId = String(context.user!.id);
  if (workspaceId) return teamService.listByWorkspace(workspaceId, userId);
  return teamService.listTeamsForProjectCreation(userId);
}, { auth: true });

/**
 * @openapi
 * /api/teams:
 *   post:
 *     tags: [Teams]
 *     summary: Create a team
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [workspaceId, name]
 *             properties:
 *               workspaceId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *                 nullable: true
 *               parentTeamId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Created team
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const POST = createPostHandler(
  async (_req, context, validated) => teamService.create(validated!, String(context.user!.id)),
  { auth: true, validateBody: createTeamSchema }
);
