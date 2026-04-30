/**
 * @fileoverview Authentication middleware stubs
 *
 * NOTE: This file is kept for backward compatibility only.
 * All API routes use `withMiddleware` from `lib/http/withMiddleware.ts`,
 * which resolves auth via Auth.js v5 session cookies (`auth()` from `lib/auth.ts`).
 *
 * The Inscript Redis token system previously in this file has been removed.
 * If you need project-level RBAC, use `assertProjectMember` / `assertProjectAdmin`
 * from `lib/auth-helpers.ts`.
 */

export interface AuthUser {
  id: string;
  externalId?: string;
  email: string;
  role: string;
  username?: string;
}

/**
 * @deprecated Use Auth.js `auth()` from `@/lib/auth` instead.
 * This stub exists to prevent import errors in files that reference AuthUser.
 */
export async function authenticateRequest(): Promise<AuthUser> {
  throw new Error(
    "authenticateRequest() is deprecated. Use Auth.js auth() session via withMiddleware({ auth: true })."
  );
}

/**
 * @deprecated Use Auth.js `auth()` from `@/lib/auth` instead.
 */
export async function optionalAuth(): Promise<AuthUser | null> {
  return null;
}

/**
 * Extract bearer token from Authorization header (utility — still useful for API-key flows)
 */
export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  return null;
}
