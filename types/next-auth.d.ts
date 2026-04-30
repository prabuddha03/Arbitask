/**
 * @fileoverview NextAuth v5 type augmentation
 *
 * Extends Auth.js Session and JWT types to include Arbitask-specific fields.
 * Without this, TypeScript does not know that `session.user.id` exists.
 *
 * @see https://authjs.dev/getting-started/typescript
 */

import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extends the built-in session.user type to include `id`.
   * The `id` is set in the `session` callback in `lib/auth.ts`.
   */
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
