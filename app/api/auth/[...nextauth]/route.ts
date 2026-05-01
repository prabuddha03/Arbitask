import type { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { checkRateLimit, RateLimiters } from "@/lib/middlewares/rate-limit.middleware";
import { handleError } from "@/lib/middlewares/error.middleware";

/** App Router catch-all segment for `app/api/auth/[...nextauth]/route.ts` */
type NextAuthRouteContext = { params: Promise<{ nextauth: string[] }> };

export async function GET(req: NextRequest, context: NextAuthRouteContext) {
  try {
    await checkRateLimit(req, null, RateLimiters.authRead);
    return handlers.GET(req, context);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest, context: NextAuthRouteContext) {
  try {
    await checkRateLimit(req, null, {
      ...RateLimiters.auth,
      keyPrefix: "auth-post",
      message: "Too many authentication attempts. Please try again later.",
    });
    return handlers.POST(req, context);
  } catch (error) {
    return handleError(error);
  }
}
