import {
  createAppRouteGetHandler,
  createAppRoutePatchHandler,
  createAppRouteDeleteHandler,
} from "@/lib/factories";
import { teamService } from "@/src/modules/teams/team.service";
import { updateTeamSchema } from "@/src/modules/teams/team.schema";
import type { UpdateTeamInput } from "@/src/modules/teams/team.schema";

/**
 * @openapi
 * /api/teams/{teamId}:
 *   get:
 *     tags: [Teams]
 *     summary: Get team with members
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Team
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const GET = createAppRouteGetHandler<{ teamId: string }, Awaited<ReturnType<typeof teamService.getById>>>(
  async (_req, context, params) => teamService.getById(params.teamId, String(context.user!.id)),
  { auth: true }
);

/**
 * @openapi
 * /api/teams/{teamId}:
 *   patch:
 *     tags: [Teams]
 *     summary: Update team (team ADMIN+)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated team
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const PATCH = createAppRoutePatchHandler<
  { teamId: string },
  Awaited<ReturnType<typeof teamService.update>>
>(
  async (_req, context, params, validated) =>
    teamService.update(params.teamId, validated as UpdateTeamInput, String(context.user!.id)),
  { auth: true, validateBody: updateTeamSchema }
);

/**
 * @openapi
 * /api/teams/{teamId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Delete empty team (team ADMIN+)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const DELETE = createAppRouteDeleteHandler<{ teamId: string }>(
  async (_req, context, params) => {
    await teamService.delete(params.teamId, String(context.user!.id));
  },
  { auth: true }
);
