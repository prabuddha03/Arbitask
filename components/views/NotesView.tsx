"use client";

import { useState, useRef, useTransition } from "react";
import { createNote, updateNote, deleteNote } from "@/lib/actions";
import { fmtDate } from "@/lib/helpers";
import { renderMd } from "@/lib/markdown";
import { Btn, Badge, Empty } from "@/components/ui";
import { Modal } from "@/components/ui/Modal";
import { SlashMenu } from "@/components/SlashMenu";
import styles from "./NotesView.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

type Project = { id: string; name: string; colorId: string };
type Note = {
  id: string;
  title: string;
  content: string;
  projectId: string | null;
  createdAt: Date;
};

interface NotesViewProps {
  notes: Note[];
  projects: Project[];
  defaultProjectId?: string;
}

export function NotesView({ notes, projects, defaultProjectId }: NotesViewProps) {
  const [pending, startTransition] = useTransition();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newProject, setNewProject] = useState(defaultProjectId || "");

  const [fullscreen, setFullscreen] = useState(false);

  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState("");
  const [slashPos, setSlashPos] = useState({ x: 0, y: 0 });
  const [slashStart, setSlashStart] = useState(-1);
  const [slashTarget, setSlashTarget] = useState<"edit" | "new" | null>(null);

  const editRef = useRef<HTMLTextAreaElement>(null);
  const newRef = useRef<HTMLTextAreaElement>(null);

  const note = notes.find((n) => n.id === activeNoteId);

  const handleTA = (e: React.ChangeEvent<HTMLTextAreaElement>, target: "edit" | "new") => {
    const val = e.target.value;
    const pos = e.target.selectionStart;
    if (target === "edit") setEditContent(val);
    else setNewContent(val);

    const ls = val.lastIndexOf("\n", pos - 1) + 1;
    const lt = val.substring(ls, pos);
    const si = lt.lastIndexOf("/");
    if (si !== -1 && (si === 0 || lt[si - 1] === " " || lt[si - 1] === "\n")) {
      const f = lt.substring(si + 1);
      if (f.length <= 20 && !/\s/.test(f)) {
        const r = e.target.getBoundingClientRect();
        setSlashOpen(true);
        setSlashFilter(f);
        setSlashStart(ls + si);
        setSlashTarget(target);
        setSlashPos({ x: 16, y: Math.min(r.height - 80, Math.max(0, (pos / val.length) * r.height)) });
        return;
      }
    }
    if (slashOpen) setSlashOpen(false);
  };

  const handleSlashSelect = (cmd: { insert: string }) => {
    const content = slashTarget === "edit" ? editContent : newContent;
    const setter = slashTarget === "edit" ? setEditContent : setNewContent;
    const ref2 = slashTarget === "edit" ? editRef : newRef;
    const before = content.substring(0, slashStart);
    const cp = ref2.current ? ref2.current.selectionStart : content.length;
    const after = content.substring(cp);
    setter(before + cmd.insert + after);
    setSlashOpen(false);
    setSlashFilter("");
    setTimeout(() => {
      if (ref2.current) {
        const np = before.length + cmd.insert.length;
        ref2.current.focus();
        ref2.current.setSelectionRange(np, np);
      }
    }, 10);
  };

  async function addNote() {
    if (!newTitle.trim()) return;
    startTransition(async () => {
      await createNote({ title: newTitle, content: newContent, projectId: newProject || null });
      setNewTitle("");
      setNewContent("");
      setNewProject("");
      setShowNew(false);
    });
  }

  async function handleUpdateNote() {
    if (!note) return;
    startTransition(async () => {
      await updateNote(note.id, { title: editTitle, content: editContent });
      setEditing(false);
    });
  }

  async function handleDeleteNote(noteId: string) {
    startTransition(async () => {
      await deleteNote(noteId);
      setActiveNoteId(null);
    });
  }

  return (
    <div className={styles.layout}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.noteCount}>{notes.length} notes</span>
          <Btn size="sm" onClick={() => setShowNew(true)}>
            + New
          </Btn>
        </div>
        <div className={styles.noteList}>
          {notes.length === 0 && <Empty icon="✎" title="No notes yet" sub="Create your first note" />}
          {notes.map((n) => {
            const proj = projects.find((p) => p.id === n.projectId);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setActiveNoteId(n.id);
                  setEditing(false);
                }}
                className={cn(styles.noteRow, activeNoteId === n.id && styles.noteRowActive)}
              >
                <div className={styles.noteRowTitle}>{n.title}</div>
                <div className={styles.noteRowMeta}>
                  <span className={styles.noteRowDate}>{fmtDate(n.createdAt)}</span>
                  {proj && <Badge size="xs">{proj.name}</Badge>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.main}>
        {!note ? (
          <Empty
            icon="✎"
            title="Select a note"
            sub="Pick a note or create a new one"
            action={<Btn onClick={() => setShowNew(true)}>Create note</Btn>}
          />
        ) : editing ? (
          <div className={styles.relative}>
            <input
              className={styles.titleInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className={styles.relative}>
              <textarea
                ref={editRef}
                value={editContent}
                onChange={(e) => handleTA(e, "edit")}
                rows={16}
                placeholder="Write in markdown... Type / for commands"
              />
              {slashOpen && slashTarget === "edit" && (
                <SlashMenu
                  position={slashPos}
                  filter={slashFilter}
                  onSelect={handleSlashSelect}
                  onClose={() => setSlashOpen(false)}
                />
              )}
            </div>
            <div className={styles.editActions}>
              <Btn onClick={handleUpdateNote} disabled={pending}>
                Save
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setEditing(false);
                  setSlashOpen(false);
                }}
              >
                Cancel
              </Btn>
              <Btn variant="ghost" onClick={() => setFullscreen(true)} className={styles.expandBtn}>
                ⛶ Expand
              </Btn>
            </div>
          </div>
        ) : (
          <div>
            <div className={styles.readHeader}>
              <div>
                <h1 className={styles.readTitle}>{note.title}</h1>
                <span className={styles.readDate}>{fmtDate(note.createdAt)}</span>
              </div>
              <div className={styles.readActions}>
                <Btn
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditTitle(note.title);
                    setEditContent(note.content);
                    setEditing(true);
                    setFullscreen(true);
                  }}
                >
                  ⛶
                </Btn>
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEditTitle(note.title);
                    setEditContent(note.content);
                    setEditing(true);
                  }}
                >
                  Edit
                </Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDeleteNote(note.id)}>
                  Delete
                </Btn>
              </div>
            </div>
            <div className={styles.mdBody} dangerouslySetInnerHTML={{ __html: renderMd(note.content) }} />
          </div>
        )}
      </div>

      <Modal
        open={fullscreen && !!note}
        onClose={() => {
          setFullscreen(false);
          setSlashOpen(false);
        }}
        fullscreen
      >
        <div className={styles.fullscreenRoot}>
          <div className={styles.fullscreenTop}>
            <input
              className={styles.fullscreenTitleInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <div className={styles.fullscreenActions}>
              <Btn
                onClick={async () => {
                  await handleUpdateNote();
                  setFullscreen(false);
                }}
                disabled={pending}
              >
                Save
              </Btn>
              <Btn
                variant="ghost"
                onClick={() => {
                  setFullscreen(false);
                  setEditing(false);
                  setSlashOpen(false);
                }}
              >
                ✕ Close
              </Btn>
            </div>
          </div>
          <div className={styles.fullscreenEditor}>
            <textarea
              ref={editRef}
              className={styles.fullscreenTextarea}
              value={editContent}
              onChange={(e) => handleTA(e, "edit")}
              placeholder="Write in markdown... Type / for commands"
            />
            {slashOpen && slashTarget === "edit" && (
              <SlashMenu
                position={slashPos}
                filter={slashFilter}
                onSelect={handleSlashSelect}
                onClose={() => setSlashOpen(false)}
              />
            )}
          </div>
        </div>
      </Modal>

      <Modal open={showNew} onClose={() => { setShowNew(false); setSlashOpen(false); }} title="New Note">
        <div className={styles.modalStack}>
          <div>
            <Label>Title</Label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title..." />
          </div>
          <div>
            <Label>Link to project</Label>
            <select value={newProject} onChange={(e) => setNewProject(e.target.value)}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.relative}>
            <Label>
              Content <span className={styles.labelHint}>— type / for commands</span>
            </Label>
            <textarea
              ref={newRef}
              value={newContent}
              onChange={(e) => handleTA(e, "new")}
              rows={8}
              placeholder="# Your thoughts here..."
            />
            {slashOpen && slashTarget === "new" && (
              <SlashMenu
                position={slashPos}
                filter={slashFilter}
                onSelect={handleSlashSelect}
                onClose={() => setSlashOpen(false)}
              />
            )}
          </div>
          <Btn onClick={addNote} disabled={!newTitle.trim() || pending}>
            Create Note
          </Btn>
        </div>
      </Modal>
    </div>
  );
}
