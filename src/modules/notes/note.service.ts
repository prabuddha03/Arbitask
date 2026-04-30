/**
 * @fileoverview Note Service — business logic for notes
 */

import { noteRepository } from "./note.repository";
import type { CreateNoteInput, UpdateNoteInput } from "./note.schema";

export const noteService = {
  async getNotesForUser(userId: string, projectId?: string | null) {
    return noteRepository.findByUser(userId, projectId);
  },

  async getNoteById(noteId: string) {
    return noteRepository.findById(noteId);
  },

  async createNote(data: CreateNoteInput, authorId: string) {
    return noteRepository.create({ ...data, authorId });
  },

  /**
   * Update a note. Caller must verify ownership before calling.
   */
  async updateNote(noteId: string, data: UpdateNoteInput) {
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    return noteRepository.update(noteId, updateData);
  },

  /**
   * Delete a note. Caller must verify ownership before calling.
   */
  async deleteNote(noteId: string) {
    return noteRepository.delete(noteId);
  },
};
