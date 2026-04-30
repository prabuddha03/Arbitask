/**
 * @openapi
 * /api/members:
 *   get:
 *     tags:
 *       - Members
 *     summary: List project members
 *     description: Returns all members of a project. Requires project membership.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID to list members for
 *     responses:
 *       200:
 *         description: List of project members
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Member'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/members/{memberId}:
 *   delete:
 *     tags:
 *       - Members
 *     summary: Remove a project member
 *     description: |
 *       Removes a member from a project.
 *       - Cannot remove the OWNER.
 *       - Users can remove themselves (leave project).
 *       - ADMIN or OWNER can remove other members.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: memberId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project member record ID
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       400:
 *         description: Cannot remove the project owner
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export {};
