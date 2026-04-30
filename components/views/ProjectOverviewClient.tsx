"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { PROJECT_STATUSES, PROJECT_PRIORITIES, PROJECT_ICONS } from "@/lib/constants";
import { updateProject } from "@/lib/actions";

type Member = { id: string; role: string; user: { id: string; name: string | null; image: string | null } };

interface ProjectOverviewClientProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    colorId: string;
    status: string;
    priority: string;
    lead: string | null;
    startDate: Date | null;
    targetDate: Date | null;
    createdAt: Date;
    members: Member[];
    tasks: { id: string; status: string }[];
  };
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10, paddingBottom: 14, marginBottom: 14, borderBottom: "1px solid var(--border)" }}>
      <div style={{ fontSize: 12, color: "var(--text3)", fontWeight: 500, minWidth: 80, flexShrink: 0, paddingTop: 1 }}>{label}</div>
      <div style={{ flex: 1, fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{children}</div>
    </div>
  );
}

export function ProjectOverviewClient({ project }: ProjectOverviewClientProps) {
  const [, startTransition] = useTransition();

  // Editable state
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [editingName, setEditingName] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { if (editingName) nameRef.current?.focus(); }, [editingName]);
  useEffect(() => { if (editingDesc) descRef.current?.focus(); }, [editingDesc]);

  function patch(data: Record<string, string | null>) {
    startTransition(() => { void updateProject(project.id, data); });
  }

  function saveName() {
    setEditingName(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== project.name) patch({ name: trimmed });
    else setName(project.name);
  }

  function saveDesc() {
    setEditingDesc(false);
    if (description !== (project.description || "")) patch({ description: description || null });
  }

  const icon = PROJECT_ICONS.find((i) => i.id === project.colorId)?.emoji ?? "📦";
  const statusInfo = PROJECT_STATUSES.find((s) => s.id === (project.status || "backlog")) ?? PROJECT_STATUSES[0];
  const priorityInfo = PROJECT_PRIORITIES.find((p) => p.id === (project.priority || "no_priority")) ?? PROJECT_PRIORITIES[0];

  const doneTasks = project.tasks.filter((t) => t.status === "done").length;
  const totalTasks = project.tasks.length;
  const progress = totalTasks > 0 ? doneTasks / totalTasks : 0;

  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null;

  return (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-start", maxWidth: 1100 }}>
      {/* ── Main content ─────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Project header — editable name */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: "var(--surface2)", border: "1px solid var(--border2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>
            {icon}
          </div>
          <div style={{ flex: 1, minWidth: 0, paddingTop: 2 }}>
            {editingName ? (
              <input
                ref={nameRef}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setName(project.name); setEditingName(false); } }}
                style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, background: "transparent", border: "none", borderBottom: "2px solid var(--accent)", borderRadius: 0, padding: "0 0 4px", width: "100%", color: "var(--text)", marginBottom: 6 }}
              />
            ) : (
              <h1
                onClick={() => setEditingName(true)}
                title="Click to edit name"
                style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.5, color: "var(--text)", marginBottom: 6, cursor: "text", borderBottom: "2px solid transparent", paddingBottom: 4, transition: "border-color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "var(--border2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                {name}
              </h1>
            )}

            {/* Editable description (subtitle) */}
            {editingDesc ? (
              <textarea
                ref={descRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDesc}
                onKeyDown={(e) => { if (e.key === "Escape") { setDescription(project.description || ""); setEditingDesc(false); } }}
                rows={3}
                style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, background: "transparent", border: "none", borderBottom: "2px solid var(--accent)", borderRadius: 0, padding: "0 0 4px", width: "100%", resize: "none" }}
                placeholder="Add a description..."
              />
            ) : (
              <p
                onClick={() => setEditingDesc(true)}
                title="Click to edit description"
                style={{ fontSize: 14, color: description ? "var(--text2)" : "var(--text3)", lineHeight: 1.6, maxWidth: 600, cursor: "text", fontStyle: description ? "normal" : "italic", borderBottom: "2px solid transparent", paddingBottom: 2, transition: "border-color .15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = "var(--border2)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
              >
                {description || "Click to add a description…"}
              </p>
            )}
          </div>
        </div>

        {/* Progress card */}
        {totalTasks > 0 && (
          <div style={{ marginBottom: 20, padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Progress</span>
              <span style={{ fontSize: 12, color: "var(--text3)" }}>{doneTasks} of {totalTasks} tasks done</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "var(--surface3)" }}>
              <div style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 3, background: "var(--accent)", transition: "width .6s cubic-bezier(0.16,1,0.3,1)" }} />
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
              {[
                { label: "Done", count: doneTasks, color: "#22C55E" },
                { label: "In progress", count: project.tasks.filter((t) => t.status === "in_progress").length, color: "var(--accent)" },
                { label: "Remaining", count: totalTasks - doneTasks - project.tasks.filter((t) => t.status === "in_progress").length, color: "var(--text3)" },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, color: "var(--text3)" }}>{count} {label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brief / editable description card */}
        <div style={{ padding: "20px 22px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.8, color: "var(--text3)", textTransform: "uppercase" }}>Brief</div>
            {!editingDesc && (
              <button
                onClick={() => setEditingDesc(true)}
                style={{ fontSize: 11, color: "var(--text3)", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontWeight: 500 }}
              >
                Edit
              </button>
            )}
          </div>
          {editingDesc ? (
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                style={{ fontSize: 14, color: "var(--text)", lineHeight: 1.7, background: "var(--surface2)", border: "1px solid var(--accent)", borderRadius: 8, padding: "10px 12px", width: "100%", resize: "vertical" }}
                placeholder="Write a project brief, goals, or collect ideas..."
                autoFocus
              />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 10 }}>
                <button onClick={() => { setDescription(project.description || ""); setEditingDesc(false); }} style={{ fontSize: 12, color: "var(--text3)", background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontWeight: 500 }}>Cancel</button>
                <button onClick={saveDesc} style={{ fontSize: 12, color: "#FFF", background: "var(--accent)", border: "none", borderRadius: 6, padding: "5px 14px", cursor: "pointer", fontWeight: 600 }}>Save</button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => setEditingDesc(true)}
              style={{ fontSize: 14, color: description ? "var(--text2)" : "var(--text3)", lineHeight: 1.7, cursor: "text", fontStyle: description ? "normal" : "italic" }}
            >
              {description || "Write a project brief, goals, or collect ideas here. Click Edit to add one."}
            </p>
          )}
        </div>
      </div>

      {/* ── Properties panel ─────────────────────── */}
      <div style={{ width: 256, flexShrink: 0 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: "var(--text3)", textTransform: "uppercase", marginBottom: 18 }}>
            Properties
          </div>

          <PropRow label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusInfo.color, flexShrink: 0, display: "inline-block" }} />
              {statusInfo.label}
            </div>
          </PropRow>

          <PropRow label="Priority">
            {priorityInfo.icon} {priorityInfo.label}
          </PropRow>

          {project.lead && (
            <PropRow label="Lead">{project.lead}</PropRow>
          )}

          {fmt(project.startDate) && (
            <PropRow label="Start">{fmt(project.startDate)}</PropRow>
          )}
          {fmt(project.targetDate) && (
            <PropRow label="Target">{fmt(project.targetDate)}</PropRow>
          )}

          <PropRow label="Members">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {project.members.map((m) => (
                <div key={m.id} title={`${m.user.name || "?"} (${m.role})`}>
                  {m.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.user.image} alt={m.user.name || ""} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "var(--accent-text)" }}>
                      {m.user.name?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PropRow>

          <PropRow label="Created">
            {fmt(project.createdAt)}
          </PropRow>
        </div>
      </div>
    </div>
  );
}
