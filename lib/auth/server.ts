/**
 * @fileoverview Server-Side Authentication Utilities
 *
 * Use these functions in Server Components and API routes
 * to get the authenticated user without client-side JavaScript.
 */

import { cookies, headers } from "next/headers";
import { cache } from "react";
import { jwtVerify } from "jose";
import { db } from "@/lib/db";

// ============================================
// Types
// ============================================

export interface ServerUser {
  id: number;
  externalId: string;
  fullName: string | null;
  fullNameBn: string | null;
  nickname: string | null;
  email: string | null;
  phone: string | null;
  emailVerified: Date | null;
  phoneVerified: Date | null;
  profileImage: string | null;
  bio: string | null;
  role: string;
  slug: string;
  createdAt: Date;
  hasValidSubscription: boolean;
}

export interface AuthResult {
  user: ServerUser | null;
  sessionId: string | null;
  isAuthenticated: boolean;
}

// ============================================
// JWT Configuration
// ============================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-min-32-chars-here"
);

interface TokenPayload {
  sub: number;
  sid: string;
  role: string;
  email?: string;
  phone?: string;
  exp: number;
  iat: number;
}

// ============================================
// Token Verification
// ============================================

async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ============================================
// User Fetching (Cached per request)
// ============================================

/**
 * Get the authenticated user from the database
 * This is cached per request to avoid multiple DB calls
 */
export const getAuthUser = cache(async (): Promise<AuthResult> => {
  // Try to get user info from middleware headers first (fastest)
  const headerStore = await headers();
  const userIdHeader = headerStore.get("x-user-id");
  const sessionIdHeader = headerStore.get("x-session-id");

  if (userIdHeader && sessionIdHeader) {
    const userId = parseInt(userIdHeader, 10);

    // Fetch full user from database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        externalId: true,
        fullName: true,
        fullNameBn: true,
        nickname: true,
        email: true,
        phone: true,
        emailVerified: true,
        phoneVerified: true,
        profileImage: true,
        bio: true,
        role: true,
        slug: true,
        createdAt: true,
      },
    });

    if (user) {
      // Check subscription status
      const { hasValidSubscription } = await import(
        "@/src/modules/subscriptions/subscription.utils"
      );
      const subscriptionValid = await hasValidSubscription(user.id);

      return {
        user: { ...user, hasValidSubscription: subscriptionValid } as ServerUser,
        sessionId: sessionIdHeader,
        isAuthenticated: true,
      };
    }
  }

  // Fallback: Try to get token from cookies and verify
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("inscript_access_token")?.value;

  if (!accessToken) {
    return { user: null, sessionId: null, isAuthenticated: false };
  }

  const payload = await verifyToken(accessToken);
  if (!payload) {
    return { user: null, sessionId: null, isAuthenticated: false };
  }

  // Fetch user from database
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      externalId: true,
      fullName: true,
      fullNameBn: true,
      nickname: true,
      email: true,
      phone: true,
      emailVerified: true,
      phoneVerified: true,
      profileImage: true,
      bio: true,
      role: true,
      slug: true,
      createdAt: true,
    },
  });

  if (!user) {
    return { user: null, sessionId: null, isAuthenticated: false };
  }

  // Check subscription status
  const { hasValidSubscription } = await import("@/src/modules/subscriptions/subscription.utils");
  const subscriptionValid = await hasValidSubscription(user.id);

  return {
    user: { ...user, hasValidSubscription: subscriptionValid } as ServerUser,
    sessionId: payload.sid,
    isAuthenticated: true,
  };
});

/**
 * Get just the authentication status (lighter weight)
 */
export const getAuthStatus = cache(
  async (): Promise<{ isAuthenticated: boolean; userId: number | null }> => {
    const headerStore = await headers();
    const userIdHeader = headerStore.get("x-user-id");

    if (userIdHeader) {
      return { isAuthenticated: true, userId: parseInt(userIdHeader, 10) };
    }

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("inscript_access_token")?.value;

    if (!accessToken) {
      return { isAuthenticated: false, userId: null };
    }

    const payload = await verifyToken(accessToken);
    if (!payload) {
      return { isAuthenticated: false, userId: null };
    }

    return { isAuthenticated: true, userId: payload.sub };
  }
);

/**
 * Require authentication - throws redirect if not authenticated
 */
export async function requireAuth(redirectTo = "/auth"): Promise<ServerUser> {
  const { user, isAuthenticated } = await getAuthUser();

  if (!isAuthenticated || !user) {
    // In server components, we can't redirect directly, so we throw
    throw new Error(`REDIRECT:${redirectTo}`);
  }

  return user;
}

/**
 * Get session ID for the current request
 */
export async function getSessionId(): Promise<string | null> {
  const headerStore = await headers();
  const sessionId = headerStore.get("x-session-id");

  if (sessionId) {
    return sessionId;
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("inscript_access_token")?.value;

  if (!accessToken) {
    return null;
  }

  const payload = await verifyToken(accessToken);
  return payload?.sid || null;
}
