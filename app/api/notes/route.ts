import type { NextRequest } from "next/server";
import { noteService } from "@/src/modules/notes/note.service";
import { createNoteSchema } from "@/src/modules/notes/note.schema";
import { withMiddleware, successResponse, createdResponse } from "@/lib/http";

/**
 * @openapi
 * /api/notes:
 *   get:
 *     tags: [Notes]
 *     summary: List notes for the authenticated user
 *     security:
 *       - CookieAuth: []
 *     parameters:
 *       - in: query
 *         name: projectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of notes
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export function GET(req: NextRequest) {
  return withMiddleware(
    async (r, context) => {
      const projectId = r.nextUrl.searchParams.get("projectId") || undefined;
      const notes = await noteService.getNotesForUser(String(context.user!.id), projectId);
      return successResponse(notes);
    },
    { auth: true }
  )(req);
}

/**
 * @openapi
 * /api/notes:
 *   post:
 *     tags: [Notes]
 *     summary: Create a note
 *     security:
 *       - CookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               projectId:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Created note
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
export function POST(req: NextRequest) {
  return withMiddleware(
    async (_r, context) => {
      const validated = createNoteSchema.parse((_r as any).__validatedBody);
      const note = await noteService.createNote(validated, String(context.user!.id));
      return createdResponse(note);
    },
    { auth: true, validateBody: createNoteSchema }
  )(req);
}
