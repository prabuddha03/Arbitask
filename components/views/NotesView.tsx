"use client";

import { useState, useRef, useTransition } from "react";
import { createNote, updateNote, deleteNote } from "@/lib/actions";
import { fmtDate } from "@/lib/helpers";
import { renderMd } from "@/lib/markdown";
import { Btn, Badge, Empty } from "@/components/ui";

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>{children}</div>;
}
import { Modal } from "@/components/ui/Modal";
import { SlashMenu } from "@/components/SlashMenu";

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
    <div style={{ display: "flex", height: "100%", minHeight: 0 }}>
      {/* Sidebar */}
      <div style={{ width: 270, minWidth: 270, borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "0 14px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text2)" }}>{notes.length} notes</span>
          <Btn size="sm" onClick={() => setShowNew(true)}>+ New</Btn>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 6px" }}>
          {notes.length === 0 && (
            <Empty icon="✎" title="No notes yet" sub="Create your first note" />
          )}
          {notes.map((n) => {
            const proj = projects.find((p) => p.id === n.projectId);
            return (
              <button
                key={n.id}
                onClick={() => { setActiveNoteId(n.id); setEditing(false); }}
                style={{ display: "block", width: "100%", textAlign: "left", padding: 10, borderRadius: 7, border: "none", cursor: "pointer", marginBottom: 2, background: activeNoteId === n.id ? "var(--accent-soft)" : "transparent", color: activeNoteId === n.id ? "var(--accent-text)" : "var(--text2)" }}
              >
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.title}</div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>{fmtDate(n.createdAt)}</span>
                  {proj && <Badge color="var(--accent)" style={{ fontSize: 9, padding: "1px 6px" }}>{proj.name}</Badge>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "0 26px", overflowY: "auto" }}>
        {!note ? (
          <Empty icon="✎" title="Select a note" sub="Pick a note or create a new one" action={<Btn onClick={() => setShowNew(true)}>Create note</Btn>} />
        ) : editing ? (
          <div style={{ position: "relative" }}>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ fontSize: 20, fontWeight: 700, background: "transparent", border: "none", borderBottom: "2px solid var(--accent)", borderRadius: 0, padding: "8px 0", marginBottom: 14, width: "100%", color: "var(--text)", outline: "none" }}
            />
            <div style={{ position: "relative" }}>
              <textarea ref={editRef} value={editContent} onChange={(e) => handleTA(e, "edit")} rows={16} placeholder="Write in markdown... Type / for commands" />
              {slashOpen && slashTarget === "edit" && (
                <SlashMenu position={slashPos} filter={slashFilter} onSelect={handleSlashSelect} onClose={() => setSlashOpen(false)} />
              )}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn onClick={handleUpdateNote} disabled={pending}>Save</Btn>
              <Btn variant="ghost" onClick={() => { setEditing(false); setSlashOpen(false); }}>Cancel</Btn>
              <Btn variant="ghost" onClick={() => setFullscreen(true)} style={{ marginLeft: "auto" }}>⛶ Expand</Btn>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{note.title}</h1>
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{fmtDate(note.createdAt)}</span>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <Btn size="sm" variant="ghost" onClick={() => { setEditTitle(note.title); setEditContent(note.content); setEditing(true); setFullscreen(true); }}>⛶</Btn>
                <Btn size="sm" variant="secondary" onClick={() => { setEditTitle(note.title); setEditContent(note.content); setEditing(true); }}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => handleDeleteNote(note.id)}>Delete</Btn>
              </div>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.8, color: "var(--text2)" }} dangerouslySetInnerHTML={{ __html: renderMd(note.content) }} />
          </div>
        )}
      </div>

      {/* Fullscreen Edit Modal */}
      <Modal open={fullscreen && !!note} onClose={() => { setFullscreen(false); setSlashOpen(false); }} fullscreen>
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexShrink: 0 }}>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ flex: 1, fontSize: 22, fontWeight: 800, background: "transparent", border: "none", borderBottom: "2px solid var(--accent)", borderRadius: 0, padding: "6px 0", color: "var(--text)", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <Btn onClick={async () => { await handleUpdateNote(); setFullscreen(false); }} disabled={pending}>Save</Btn>
              <Btn variant="ghost" onClick={() => { setFullscreen(false); setEditing(false); setSlashOpen(false); }}>✕ Close</Btn>
            </div>
          </div>
          <div style={{ position: "relative", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <textarea
              ref={editRef}
              value={editContent}
              onChange={(e) => handleTA(e, "edit")}
              placeholder="Write in markdown... Type / for commands"
              style={{ flex: 1, resize: "none", height: "100%", fontSize: 15, lineHeight: 1.8, }}
            />
            {slashOpen && slashTarget === "edit" && (
              <SlashMenu position={slashPos} filter={slashFilter} onSelect={handleSlashSelect} onClose={() => setSlashOpen(false)} />
            )}
          </div>
        </div>
      </Modal>

      {/* New Note Modal */}
      <Modal open={showNew} onClose={() => { setShowNew(false); setSlashOpen(false); }} title="New Note">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <Label>Title</Label>
            <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Note title..." />
          </div>
          <div>
            <Label>Link to project</Label>
            <select value={newProject} onChange={(e) => setNewProject(e.target.value)}>
              <option value="">No project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <Label>Content <span style={{ fontWeight: 400, color: "var(--text3)" }}>— type / for commands</span></Label>
            <textarea ref={newRef} value={newContent} onChange={(e) => handleTA(e, "new")} rows={8} placeholder="# Your thoughts here..." />
            {slashOpen && slashTarget === "new" && (
              <SlashMenu position={slashPos} filter={slashFilter} onSelect={handleSlashSelect} onClose={() => setSlashOpen(false)} />
            )}
          </div>
          <Btn onClick={addNote} disabled={!newTitle.trim() || pending}>Create Note</Btn>
        </div>
      </Modal>
    </div>
  );
}
