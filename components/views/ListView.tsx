"use client";

import { useTransition, useState } from "react";
import { STATUSES, TASK_TYPES } from "@/lib/constants";
import { fmtDate } from "@/lib/helpers";
import { Badge, Empty } from "@/components/ui";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { updateTask, deleteTask, addAssignee, removeAssignee } from "@/lib/actions";
import styles from "./ListView.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

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

interface ListViewProps {
  project?: Project;
  projects?: Project[];
}

export function ListView({ project, projects }: ListViewProps) {
  const [, startTransition] = useTransition();
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  const isGlobal = !!projects;
  const allProjects = projects || (project ? [project] : []);
  const filteredProjects = filterProjectId ? allProjects.filter((p) => p.id === filterProjectId) : allProjects;

  const allTasksWithProject = filteredProjects.flatMap((p) => p.tasks.map((t) => ({ ...t, _project: p })));

  const STATUS_ORDER = ["in_progress", "blocked", "planned", "idea", "done", "archived"];
  const sorted = [...allTasksWithProject].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  const detailEntry = sorted.find((t) => t.id === detailTaskId);
  const detailTask = detailEntry ? (({ _project: _p, ...rest }) => rest as Task)(detailEntry) : null;
  const detailProject = detailEntry?._project || null;

  async function handleUpdateTask(taskId: string, updates: Record<string, unknown>) {
    startTransition(() => {
      void updateTask(taskId, updates as Parameters<typeof updateTask>[1]);
    });
  }

  async function handleDeleteTask(taskId: string) {
    startTransition(() => {
      void deleteTask(taskId);
    });
  }

  async function handleAssigneeChange(taskId: string, userId: string, selected: boolean) {
    startTransition(() => {
      void (selected ? addAssignee(taskId, userId) : removeAssignee(taskId, userId));
    });
  }

  if (!sorted.length) return <Empty icon="📝" title="No tasks yet" sub="Add tasks from Kanban view" />;

  return (
    <>
      {isGlobal && (
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Filter by project</span>
          <select
            className={styles.filterSelect}
            value={filterProjectId}
            onChange={(e) => setFilterProjectId(e.target.value)}
          >
            <option value="">All projects</option>
            {allProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.wrap}>
        <div className={cn(styles.head, isGlobal ? styles.headGlobal : styles.headProject)}>
          <span>Task</span>
          {isGlobal && <span>Project</span>}
          <span>Type</span>
          <span>Status</span>
          <span>Start</span>
          <span>Due</span>
          <span />
        </div>
        {sorted.map((task) => {
          const tt = TASK_TYPES.find((t) => t.id === task.type) || TASK_TYPES[5];
          return (
            <div
              key={task.id}
              className={cn(styles.row, isGlobal ? styles.rowGlobal : styles.rowProject)}
              onClick={() => setDetailTaskId(task.id)}
            >
              <span className={styles.taskTitle}>
                {task.title}
                {task.description && <span className={styles.descHint}>📝</span>}
              </span>
              {isGlobal && <span className={styles.projectPill}>{task._project.name}</span>}
              <Badge size="sm">
                {tt.icon} {tt.label}
              </Badge>
              <select
                className={styles.statusSelect}
                data-status={task.status}
                value={task.status}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => handleUpdateTask(task.id, { status: e.target.value })}
              >
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.emoji} {s.label}
                  </option>
                ))}
              </select>
              <span className={styles.dateCell}>{fmtDate(task.startDate) || "—"}</span>
              <span className={styles.dateCell}>{fmtDate(task.dueDate) || "—"}</span>
              <button
                type="button"
                className={styles.delBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteTask(task.id);
                }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

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
