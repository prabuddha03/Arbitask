/**
 * @openapi
 * /api/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a task
 *     description: Creates a new task in a project. Requires project membership.
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTaskRequest'
 *           example:
 *             projectId: "clx123abc"
 *             title: "Design the login page"
 *             type: "design"
 *             status: "planned"
 *             dueDate: "2025-06-30T00:00:00Z"
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *
 * /api/tasks/{taskId}:
 *   patch:
 *     tags:
 *       - Tasks
 *     summary: Update a task
 *     description: Updates task fields. Requires project membership.
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
 *             $ref: '#/components/schemas/UpdateTaskRequest'
 *           example:
 *             status: "in_progress"
 *             dueDate: "2025-07-15T00:00:00Z"
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete a task
 *     description: Permanently deletes a task. Requires project membership.
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
 *         description: Deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateTaskRequest:
 *       type: object
 *       required:
 *         - projectId
 *         - title
 *       properties:
 *         projectId:
 *           type: string
 *           example: "clx123abc"
 *         title:
 *           type: string
 *           minLength: 1
 *           maxLength: 200
 *           example: "Implement auth flow"
 *         type:
 *           type: string
 *           enum: [design, dev, research, content, marketing, other]
 *           default: "dev"
 *         status:
 *           type: string
 *           enum: [idea, planned, in_progress, blocked, done, archived]
 *           default: "idea"
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         description:
 *           type: string
 *           maxLength: 5000
 *           nullable: true
 *     UpdateTaskRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         type:
 *           type: string
 *           enum: [design, dev, research, content, marketing, other]
 *         status:
 *           type: string
 *           enum: [idea, planned, in_progress, blocked, done, archived]
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         dueDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         description:
 *           type: string
 *           nullable: true
 */
export {};
