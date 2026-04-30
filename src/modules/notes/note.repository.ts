/**
 * @fileoverview Note Repository — database queries for notes
 */

import { db } from "@/lib/db";

export const noteRepository = {
  async findByUser(userId: string, projectId?: string | null) {
    return db.note.findMany({
      where: {
        authorId: userId,
        ...(projectId ? { projectId } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(noteId: string) {
    return db.note.findUnique({ where: { id: noteId } });
  },

  async create(data: { title: string; content?: string; projectId?: string | null; authorId: string }) {
    return db.note.create({
      data: {
        title: data.title,
        content: data.content || "",
        projectId: data.projectId || null,
        authorId: data.authorId,
      },
    });
  },

  async update(noteId: string, data: Record<string, unknown>) {
    return db.note.update({ where: { id: noteId }, data });
  },

  async delete(noteId: string) {
    return db.note.delete({ where: { id: noteId } });
  },
};
