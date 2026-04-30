/**
 * @openapi
 * /api/tasks/{taskId}/assignees:
 *   get:
 *     tags:
 *       - Assignees
 *     summary: List task assignees
 *     description: Returns all users assigned to a task. Requires project membership.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assignees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   taskId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   user:
 *                     $ref: '#/components/schemas/UserMini'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   post:
 *     tags:
 *       - Assignees
 *     summary: Add assignee
 *     description: Assigns a user to a task. The user must be a project member.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "clx456def"
 *     responses:
 *       201:
 *         description: Assignee added
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     tags:
 *       - Assignees
 *     summary: Remove assignee
 *     description: Removes a user from a task's assignees.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Assignee removed
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
export {};
