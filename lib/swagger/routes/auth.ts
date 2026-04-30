/**
 * @openapi
 * /api/auth/{...nextauth}:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Auth.js handler (GET)
 *     description: |
 *       Auth.js v5 catch-all handler. Handles:
 *       - GET /api/auth/signin — Sign-in page
 *       - GET /api/auth/signout — Sign-out
 *       - GET /api/auth/session — Get current session
 *       - GET /api/auth/csrf — Get CSRF token
 *       - GET /api/auth/providers — List auth providers
 *       - GET /api/auth/callback/:provider — OAuth callback
 *     responses:
 *       200:
 *         description: Auth.js response (varies by sub-route)
 *       302:
 *         description: Redirect (OAuth flow)
 *   post:
 *     tags:
 *       - Auth
 *     summary: Auth.js handler (POST)
 *     description: |
 *       Auth.js v5 catch-all handler. Handles:
 *       - POST /api/auth/signin/:provider — Initiate sign-in
 *       - POST /api/auth/signout — Sign out
 *       - POST /api/auth/callback/credentials — Credentials login
 *     responses:
 *       200:
 *         description: Auth.js response (varies by sub-route)
 *       302:
 *         description: Redirect (after sign-in/sign-out)
 */
export {};
