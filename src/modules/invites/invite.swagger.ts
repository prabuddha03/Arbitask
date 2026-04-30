/**
 * @openapi
 * /api/invites:
 *   post:
 *     tags:
 *       - Invites
 *     summary: Create an invite link
 *     description: |
 *       Generates a shareable invite link for a project (expires in 7 days).
 *       Requires ADMIN or OWNER role in the project.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: string
 *                 example: "clx123abc"
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MEMBER, VIEWER]
 *                 default: "MEMBER"
 *                 description: The role the invited user will receive
 *     responses:
 *       201:
 *         description: Invite token created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Use as /invite/{token} to construct the full invite URL
 *                   example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/invites/{token}:
 *   get:
 *     tags:
 *       - Invites
 *     summary: Get invite info
 *     description: |
 *       Returns invite details for the accept page. Does not require authentication
 *       (used to show invite preview before sign-in).
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The invite token from the URL
 *     responses:
 *       200:
 *         description: Invite details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InviteInfo'
 *       404:
 *         description: Invalid invite token
 *       410:
 *         description: Invite expired or already accepted
 *   post:
 *     tags:
 *       - Invites
 *     summary: Accept an invite
 *     description: |
 *       Accepts an invite, adding the authenticated user as a project member.
 *       If the user is already a member, the invite is still marked as accepted.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invite accepted, returns projectId to redirect to
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectId:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: Invalid invite token
 *       410:
 *         description: Invite expired or already accepted
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     InviteInfo:
 *       type: object
 *       properties:
 *         projectId:
 *           type: string
 *         projectName:
 *           type: string
 *           example: "My Project"
 *         role:
 *           type: string
 *           enum: [OWNER, ADMIN, MEMBER, VIEWER]
 *         expiresAt:
 *           type: string
 *           format: date-time
 */
export {};
