import type { NextRequest } from "next/server";
import { noteService } from "@/src/modules/notes/note.service";
import { updateNoteSchema } from "@/src/modules/notes/note.schema";
import { withMiddleware, successResponse, noContentResponse } from "@/lib/http";
import { ApiErrors } from "@/lib/middlewares";

type Params = { params: Promise<{ noteId: string }> };

async function getNoteAndVerifyOwner(noteId: string, userId: string) {
  const note = await noteService.getNoteById(noteId);
  if (!note) throw ApiErrors.NotFound("Note not found");
  if (note.authorId !== userId) throw ApiErrors.Forbidden("You do not own this note");
  return note;
}

export function PATCH(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { noteId } = await params;
      await getNoteAndVerifyOwner(noteId, String(context.user!.id));
      const validated = updateNoteSchema.parse((_r as any).__validatedBody);
      const updated = await noteService.updateNote(noteId, validated);
      return successResponse(updated);
    },
    { auth: true, validateBody: updateNoteSchema }
  )(req);
}

export function DELETE(req: NextRequest, { params }: Params) {
  return withMiddleware(
    async (_r, context) => {
      const { noteId } = await params;
      await getNoteAndVerifyOwner(noteId, String(context.user!.id));
      await noteService.deleteNote(noteId);
      return noContentResponse();
    },
    { auth: true }
  )(req);
}
