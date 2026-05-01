import { createAppRoutePostHandler } from "@/lib/factories";
import { teamService } from "@/src/modules/teams/team.service";
import { addTeamMemberSchema, type AddTeamMemberInput } from "@/src/modules/teams/team.schema";

/**
 * @openapi
 * /api/teams/{teamId}/members:
 *   post:
 *     tags: [Teams]
 *     summary: Add or update a team member (team ADMIN+)
 *     description: Target user must already belong to the workspace.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [OWNER, ADMIN, MEMBER, VIEWER]
 *     responses:
 *       201:
 *         description: Member saved
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export const POST = createAppRoutePostHandler<{ teamId: string }, unknown>(
  async (_req, context, params, validated) =>
    teamService.addMember(params.teamId, validated as AddTeamMemberInput, String(context.user!.id)),
  { auth: true, validateBody: addTeamMemberSchema }
);
