import {
  createAppRoutePatchHandler,
  createAppRouteDeleteHandler,
} from "@/lib/factories";
import { teamService } from "@/src/modules/teams/team.service";
import { updateTeamMemberSchema, type UpdateTeamMemberInput } from "@/src/modules/teams/team.schema";

/**
 * @openapi
 * /api/teams/{teamId}/members/{memberId}:
 *   patch:
 *     tags: [Teams]
 *     summary: Update team member role (team ADMIN+)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [OWNER, ADMIN, MEMBER, VIEWER]
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const PATCH = createAppRoutePatchHandler<{ teamId: string; memberId: string }, unknown>(
  async (_req, context, params, validated) =>
    teamService.updateMemberRole(
      params.teamId,
      params.memberId,
      validated as UpdateTeamMemberInput,
      String(context.user!.id)
    ),
  { auth: true, validateBody: updateTeamMemberSchema }
);

/**
 * @openapi
 * /api/teams/{teamId}/members/{memberId}:
 *   delete:
 *     tags: [Teams]
 *     summary: Remove team member (self or team ADMIN+)
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Removed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const DELETE = createAppRouteDeleteHandler<{ teamId: string; memberId: string }>(
  async (_req, context, params) => {
    await teamService.removeMember(params.teamId, params.memberId, String(context.user!.id));
  },
  { auth: true }
);
