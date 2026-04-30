/**
 * @fileoverview Server-side auth utilities
 *
 * Export all server-side authentication functions
 * Use these in Server Components, Route Handlers, and Server Actions
 */

export {
  getAuthUser,
  getAuthStatus,
  requireAuth,
  getSessionId,
  type ServerUser,
  type AuthResult,
} from "./server";
