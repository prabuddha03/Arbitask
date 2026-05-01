/**
 * @openapi
 * /api/projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List all projects
 *     description: Returns all projects the authenticated user is a member of
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create a project
 *     description: Creates a new project and automatically adds the creator as OWNER
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *           example:
 *             name: "My New Project"
 *             description: "A project to track ideas"
 *             colorId: "rose"
 *             status: "backlog"
 *             priority: "high"
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/projects/{projectId}:
 *   patch:
 *     tags:
 *       - Projects
 *     summary: Update a project
 *     description: Updates project fields. Requires ADMIN or OWNER role.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: The project ID (cuid)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *           example:
 *             name: "Renamed Project"
 *             status: "in_progress"
 *             priority: "urgent"
 *     responses:
 *       200:
 *         description: Updated project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete a project
 *     description: Permanently deletes a project. Only the OWNER can delete.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
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
 *                   example: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     CreateProjectRequest:
 *       type: object
 *       required:
 *         - teamId
 *         - name
 *       properties:
 *         teamId:
 *           type: string
 *           description: Team that owns the project (Member+ required on team)
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *           example: "My Project"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           nullable: true
 *         colorId:
 *           type: string
 *           default: "rose"
 *           example: "violet"
 *         status:
 *           type: string
 *           enum: [backlog, in_progress, on_track, at_risk, completed, cancelled]
 *           default: "backlog"
 *         priority:
 *           type: string
 *           enum: [no_priority, urgent, high, medium, low]
 *           default: "no_priority"
 *         lead:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         targetDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     UpdateProjectRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           nullable: true
 *         colorId:
 *           type: string
 *         status:
 *           type: string
 *           enum: [backlog, in_progress, on_track, at_risk, completed, cancelled]
 *         priority:
 *           type: string
 *           enum: [no_priority, urgent, high, medium, low]
 *         lead:
 *           type: string
 *           nullable: true
 *         startDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         targetDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 */
export {};
