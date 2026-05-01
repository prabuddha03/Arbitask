import { inviteService } from "@/src/modules/invites/invite.service";
import { createAppRouteGetHandler, createAppRoutePostHandler } from "@/lib/factories";
import { ApiErrors } from "@/lib/middlewares";
import { RateLimiters } from "@/lib/middlewares/rate-limit.middleware";

type InvitePreviewPayload = {
  projectId: string;
  projectName: string;
  role: string;
  expiresAt: Date;
};

/** OpenAPI: see `src/modules/invites/invite.swagger.ts` */
export const GET = createAppRouteGetHandler<{ token: string }, InvitePreviewPayload>(
  async (_req, _context, params) => {
    const result = await inviteService.getInviteByToken(params.token);
    if ("error" in result) {
      if (result.error === "INVALID_INVITE") throw ApiErrors.NotFound("Invalid invite token");
      throw ApiErrors.Gone("Invite has expired or already been accepted");
    }
    return result.data;
  },
  { optionalAuth: true, rateLimit: RateLimiters.inviteTokenPreview }
);

/** OpenAPI: see `src/modules/invites/invite.swagger.ts` */
export const POST = createAppRoutePostHandler<{ token: string }, { projectId: string }>(
  async (_req, context, params) => {
    const result = await inviteService.acceptInvite(params.token, String(context.user!.id));
    if ("error" in result) {
      if (result.error === "INVALID_INVITE") throw ApiErrors.NotFound("Invalid invite token");
      throw ApiErrors.Gone("Invite has expired or already been accepted");
    }
    return result.data;
  },
  { auth: true, rateLimit: RateLimiters.inviteAccept }
);
