import { inviteService } from "@/src/modules/invites/invite.service";
import { createInviteSchema } from "@/src/modules/invites/invite.schema";
import { createPostHandler } from "@/lib/factories";
import { assertProjectAdmin } from "@/lib/auth-helpers";
import { RateLimiters } from "@/lib/middlewares/rate-limit.middleware";

/** OpenAPI: see `src/modules/invites/invite.swagger.ts` */
export const POST = createPostHandler(
  async (_req, context, validated) => {
    await assertProjectAdmin(validated.projectId, String(context.user!.id));
    return inviteService.createInvite(validated, String(context.user!.id));
  },
  { auth: true, validateBody: createInviteSchema, rateLimit: RateLimiters.generateInvite }
);
