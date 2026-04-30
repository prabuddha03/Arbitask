import type { NextRequest } from "next/server";
import { inviteService } from "@/src/modules/invites/invite.service";
import { withMiddleware, successResponse, createdResponse } from "@/lib/http";
import { ApiErrors } from "@/lib/middlewares";

type Params = { params: Promise<{ token: string }> };

export function GET(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async () => {
      const { token } = await params;
      const result = await inviteService.getInviteByToken(token);
      if ("error" in result) {
        if (result.error === "INVALID_INVITE") throw ApiErrors.NotFound("Invalid invite token");
        throw ApiErrors.Gone("Invite has expired or already been accepted");
      }
      return successResponse(result.data);
    },
    { optionalAuth: true }
  )(req);
}

export function POST(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { token } = await params;
      const result = await inviteService.acceptInvite(token, String(context.user!.id));
      if ("error" in result) {
        if (result.error === "INVALID_INVITE") throw ApiErrors.NotFound("Invalid invite token");
        throw ApiErrors.Gone("Invite has expired or already been accepted");
      }
      return createdResponse(result.data);
    },
    { auth: true }
  )(req);
}
