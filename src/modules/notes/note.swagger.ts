/**
 * @openapi
 * /api/notes:
 *   get:
 *     tags:
 *       - Notes
 *     summary: List notes
 *     description: Returns notes for the authenticated user, optionally filtered by project
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *         description: Filter notes by project ID
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Note'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags:
 *       - Notes
 *     summary: Create a note
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 example: "My first note"
 *               content:
 *                 type: string
 *                 maxLength: 50000
 *                 example: "# Hello\n\nThis is markdown content."
 *               projectId:
 *                 type: string
 *                 nullable: true
 *                 example: "clx123abc"
 *     responses:
 *       201:
 *         description: Note created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 * /api/notes/{noteId}:
 *   patch:
 *     tags:
 *       - Notes
 *     summary: Update a note
 *     description: Updates note content. Only the note author can update.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               projectId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   delete:
 *     tags:
 *       - Notes
 *     summary: Delete a note
 *     description: Permanently deletes a note. Only the author can delete.
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
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
 */
export {};
