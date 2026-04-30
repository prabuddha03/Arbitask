/**
 * @fileoverview Authentication middleware
 *
 * Validates JWT tokens stored in Upstash Redis
 */

import { NextRequest } from "next/server";
import { queue } from "../cache";
import { ApiErrors } from "./error.middleware";

export interface AuthUser {
  id: number;
  externalId: string;
  email: string;
  role: string;
  username?: string;
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractToken(req: Request | NextRequest): string | null {
  // First, check Authorization header (preferred method for API clients)
  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    // Support both "Bearer <token>" and "<token>"
    const parts = authHeader.split(" ");
    return parts.length === 2 ? parts[1] : parts[0];
  }

  // Check cookies (for HttpOnly cookie-based auth)
  // Try NextRequest cookies API first (if available)
  if ("cookies" in req && typeof (req as NextRequest).cookies?.get === "function") {
    const cookieToken = (req as NextRequest).cookies.get("inscript_access_token")?.value;
    if (cookieToken) {
      return cookieToken;
    }
  }

  // Fallback: Extract from Cookie header (always available in Request)
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").reduce(
      (acc, cookie) => {
        const trimmed = cookie.trim();
        const equalIndex = trimmed.indexOf("=");
        if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim();
          const value = trimmed.substring(equalIndex + 1).trim();
          if (key && value) {
            try {
              acc[key] = decodeURIComponent(value);
            } catch {
              // If decode fails, use raw value
              acc[key] = value;
            }
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );

    if (cookies["inscript_access_token"]) {
      return cookies["inscript_access_token"];
    }
  }

  return null;
}

/**
 * Verify token and get user
 */
export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    // Get token data from Upstash Redis
    const tokenData = await queue.getToken(token);

    if (!tokenData) {
      return null;
    }

    // Check if token is expired
    if (tokenData.expiresAt && new Date(tokenData.expiresAt) < new Date()) {
      await queue.revokeToken(token);
      return null;
    }

    return tokenData.user as AuthUser;
  } catch (error) {
    console.error("Auth: Token verification failed:", error);
    return null;
  }
}

/**
 * Authenticate request
 */
export async function authenticateRequest(req: Request | NextRequest): Promise<AuthUser> {
  const token = extractToken(req);

  if (!token) {
    throw ApiErrors.Unauthorized("Missing authentication token");
  }

  const user = await verifyToken(token);

  if (!user) {
    throw ApiErrors.Unauthorized("Invalid or expired token");
  }

  return user;
}

/**
 * Optional authentication (returns null if not authenticated)
 */
export async function optionalAuth(req: Request | NextRequest): Promise<AuthUser | null> {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  return await verifyToken(token);
}

/**
 * Require specific role
 */
export function requireRole(user: AuthUser, allowedRoles: string[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw ApiErrors.Forbidden(`Requires one of: ${allowedRoles.join(", ")}`);
  }
}

/**
 * Check if user has role
 */
export function hasRole(user: AuthUser, role: string): boolean {
  return user.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

/**
 * Check if user is moderator or admin
 */
export function isModerator(user: AuthUser): boolean {
  return user.role === "MODERATOR" || user.role === "ADMIN";
}
