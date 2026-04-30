"use client";

import { useState, useTransition } from "react";
import { STATUSES, TASK_TYPES } from "@/lib/constants";
import { stC } from "@/lib/theme";
import { fmtDate } from "@/lib/helpers";
import { Badge, Empty, Avatar } from "@/components/ui";
import { TaskModal } from "@/components/modals/TaskModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { createTask, updateTask, deleteTask, addAssignee, removeAssignee } from "@/lib/actions";

type TaskUser = { id: string; name: string | null; image: string | null };
type Member = { id: string; userId: string; role: string; user: TaskUser };
type Task = {
  id: string;
  title: string;
  type: string;
  status: string;
  startDate: Date | null;
  dueDate: Date | null;
  description: string | null;
  createdAt: Date;
  projectId: string;
  assignees: Array<{ user: TaskUser }>;
};
type Project = {
  id: string;
  name: string;
  colorId: string;
  tasks: Task[];
  members: Member[];
};

interface KanbanViewProps {
  project?: Project;
  projects?: Project[];
  initialAddStatus?: string;
}

export function KanbanView({ project, projects, initialAddStatus }: KanbanViewProps) {
  const [, startTransition] = useTransition();
  const [drag, setDrag] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [initialStatus, setInitialStatus] = useState(initialAddStatus || "idea");
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  const isGlobal = !!projects;
  const allProjects = projects || (project ? [project] : []);
  const filteredProjects = filterProjectId
    ? allProjects.filter((p) => p.id === filterProjectId)
    : allProjects;

  const allTasks = filteredProjects.flatMap((p) =>
    p.tasks.map((t) => ({ ...t, _project: p }))
  );

  const detailTaskEntry = allTasks.find((t) => t.id === detailTaskId);
  const detailTask = detailTaskEntry
    ? (({ _project: _p, ...rest }) => rest as Task)(detailTaskEntry)
    : null;
  const detailProject = detailTaskEntry?._project || null;

  function handleUpdateTaskStatus(taskId: string, newStatus: string) {
    startTransition(() => updateTask(taskId, { status: newStatus }));
  }

  function handleCreateTask(data: { title: string; type: string; status: string; startDate: string; dueDate: string; projectId?: string }) {
    const pid = data.projectId || project?.id;
    if (!pid) return;
    startTransition(() => createTask({ projectId: pid, title: data.title, type: data.type, status: data.status, startDate: data.startDate || null, dueDate: data.dueDate || null }));
  }

  function handleDeleteTask(taskId: string) {
    startTransition(() => deleteTask(taskId));
  }

  function handleUpdateTask(taskId: string, updates: Record<string, unknown>) {
    startTransition(() => updateTask(taskId, updates as Parameters<typeof updateTask>[1]));
  }

  function handleAssigneeChange(taskId: string, userId: string, selected: boolean) {
    startTransition(() => selected ? addAssignee(taskId, userId) : removeAssignee(taskId, userId));
  }

  if (allProjects.length === 0) {
    return <Empty icon="🗂" title="No projects yet" sub="Create a project to get started" />;
  }

  return (
    <>
      {isGlobal && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>Filter by project</span>
          <select
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
            style={{ fontSize: 12, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border2)", background: "var(--surface2)", color: "var(--text)", width: "auto", maxWidth: 200 }}
          >
            <option value="">All projects</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, overflowX: "auto", height: isGlobal ? "calc(100% - 48px)" : "100%", minHeight: 0 }}>
        {STATUSES.filter((s) => s.id !== "archived").map((status) => {
          const tasks = allTasks.filter((t) => t.status === status.id);
          const sc = stC(status.id);
          return (
            <div
              key={status.id}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.background = "var(--glass)"; }}
              onDragLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              onDrop={(e) => {
                e.currentTarget.style.background = "transparent";
                if (drag) { handleUpdateTaskStatus(drag, status.id); setDrag(null); }
              }}
              style={{ flex: "1 0 220px", maxWidth: 300, display: "flex", flexDirection: "column", borderRadius: 14, transition: "background .2s" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 4px 12px" }}>
                <span style={{ fontSize: 15 }}>{status.emoji}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{status.label}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: sc, background: sc + "18", padding: "2px 7px", borderRadius: 10 }}>{tasks.length}</span>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7, overflowY: "auto" }}>
                {tasks.map((task) => {
                  const tt = TASK_TYPES.find((t) => t.id === task.type) || TASK_TYPES[5];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDrag(task.id)}
                      onDragEnd={() => setDrag(null)}
                      onClick={() => setDetailTaskId(task.id)}
                      style={{ padding: 12, borderRadius: 9, background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer", transition: "border-color .15s, box-shadow .15s", opacity: drag === task.id ? 0.4 : 1 }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.boxShadow = "0 4px 16px var(--shadow)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.4, flex: 1, color: "var(--text)" }}>{task.title}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                          style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, opacity: 0.5, padding: "2px" }}
                        >
                          ✕
                        </button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                        <Badge color="var(--accent)" style={{ fontSize: 10 }}>{tt.icon} {tt.label}</Badge>
                        {isGlobal && (
                          <span style={{ fontSize: 10, color: "var(--text2)", background: "var(--surface2)", padding: "2px 6px", borderRadius: 5, fontWeight: 500 }}>
                            {task._project.name}
                          </span>
                        )}
                        {task.dueDate && <span style={{ fontSize: 10, color: "var(--text3)" }}>📅 {fmtDate(task.dueDate)}</span>}
                        {task.description && <span style={{ fontSize: 10, color: "var(--text3)" }}>📝</span>}
                      </div>
                      {task.assignees.length > 0 && (
                        <div style={{ display: "flex", marginTop: 8 }}>
                          {task.assignees.slice(0, 3).map((a, i) => (
                            <div key={a.user.id} style={{ marginLeft: i > 0 ? -6 : 0 }}>
                              <Avatar user={a.user} size={22} />
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "var(--text2)", marginLeft: -6, border: "2px solid var(--surface)" }}>
                              +{task.assignees.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => { setInitialStatus(status.id); setShowTaskModal(true); }}
                  style={{ padding: 9, borderRadius: 9, border: "1px dashed var(--border2)", background: "transparent", color: "var(--text3)", cursor: "pointer", fontSize: 12, fontWeight: 500 }}
                >
                  + Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TaskModal
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleCreateTask}
        initialStatus={initialStatus}
        projects={isGlobal ? allProjects.map((p) => ({ id: p.id, name: p.name })) : undefined}
        initialProjectId={isGlobal ? (filterProjectId || allProjects[0]?.id) : project?.id}
      />

      {detailProject && (
        <TaskDetailModal
          open={!!detailTaskId}
          onClose={() => setDetailTaskId(null)}
          task={detailTask}
          project={detailProject}
          onUpdateTask={handleUpdateTask}
          onAssigneeChange={handleAssigneeChange}
        />
      )}
    </>
  );
}
