import type { NextRequest } from "next/server";
import { memberService } from "@/src/modules/members/member.service";
import { withMiddleware, noContentResponse } from "@/lib/http";
import { ApiErrors } from "@/lib/middlewares";

type Params = { params: Promise<{ memberId: string }> };

export function DELETE(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { memberId } = await params;
      const result = await memberService.removeMember(memberId, String(context.user!.id));
      if ("error" in result) {
        if (result.error === "NOT_FOUND") throw ApiErrors.NotFound("Member not found");
        if (result.error === "CANNOT_REMOVE_OWNER") throw ApiErrors.BadRequest("Cannot remove the project owner");
        throw ApiErrors.Forbidden("Insufficient permissions");
      }
      return noContentResponse();
    },
    { auth: true }
  )(req);
}
