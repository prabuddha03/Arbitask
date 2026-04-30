import type { NextRequest } from "next/server";
import { inviteService } from "@/src/modules/invites/invite.service";
import { createInviteSchema } from "@/src/modules/invites/invite.schema";
import { withMiddleware, createdResponse } from "@/lib/http";
import { assertProjectAdmin } from "@/lib/auth-helpers";
import { ApiErrors } from "@/lib/middlewares";

/**
 * @openapi
 * /api/invites:
 *   post:
 *     tags: [Invites]
 *     summary: Generate an invite link (ADMIN or OWNER only)
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId]
 *             properties:
 *               projectId:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *                 default: MEMBER
 *     responses:
 *       201:
 *         description: Invite token
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export function POST(req: NextRequest) {
  return withMiddleware(
    async (_r, context) => {
      const validated = createInviteSchema.parse((_r as any).__validatedBody);
      await assertProjectAdmin(validated.projectId, String(context.user!.id));
      
      const result = await inviteService.createInvite(validated, String(context.user!.id));
      return createdResponse(result);
    },
    { auth: true, validateBody: createInviteSchema }
  )(req);
}
