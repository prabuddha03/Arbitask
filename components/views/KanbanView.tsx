"use client";

import { useState, useTransition } from "react";
import { STATUSES, TASK_TYPES } from "@/lib/constants";
import { fmtDate } from "@/lib/helpers";
import { Badge, Empty, Avatar } from "@/components/ui";
import { TaskModal } from "@/components/modals/TaskModal";
import { TaskDetailModal } from "@/components/modals/TaskDetailModal";
import { createTask, updateTask, deleteTask, addAssignee, removeAssignee } from "@/lib/actions";
import styles from "./KanbanView.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const COUNT_TONE: Record<string, string> = {
  idea: styles.count_idea,
  planned: styles.count_planned,
  in_progress: styles.count_in_progress,
  blocked: styles.count_blocked,
  done: styles.count_done,
};

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
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [initialStatus, setInitialStatus] = useState(initialAddStatus || "idea");
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  const isGlobal = !!projects;
  const allProjects = projects || (project ? [project] : []);
  const filteredProjects = filterProjectId ? allProjects.filter((p) => p.id === filterProjectId) : allProjects;

  const allTasks = filteredProjects.flatMap((p) => p.tasks.map((t) => ({ ...t, _project: p })));

  const detailTaskEntry = allTasks.find((t) => t.id === detailTaskId);
  const detailTask = detailTaskEntry ? (({ _project: _p, ...rest }) => rest as Task)(detailTaskEntry) : null;
  const detailProject = detailTaskEntry?._project || null;

  async function handleUpdateTaskStatus(taskId: string, newStatus: string) {
    startTransition(() => {
      void updateTask(taskId, { status: newStatus });
    });
  }

  async function handleCreateTask(data: {
    title: string;
    type: string;
    status: string;
    startDate: string;
    dueDate: string;
    projectId?: string;
  }) {
    const pid = data.projectId || project?.id;
    if (!pid) return;
    startTransition(() => {
      void createTask({
        projectId: pid,
        title: data.title,
        type: data.type,
        status: data.status,
        startDate: data.startDate || null,
        dueDate: data.dueDate || null,
      });
    });
  }

  async function handleDeleteTask(taskId: string) {
    startTransition(() => {
      void deleteTask(taskId);
    });
  }

  async function handleUpdateTask(taskId: string, updates: Record<string, unknown>) {
    startTransition(() => {
      void updateTask(taskId, updates as Parameters<typeof updateTask>[1]);
    });
  }

  async function handleAssigneeChange(taskId: string, userId: string, selected: boolean) {
    startTransition(() => {
      void (selected ? addAssignee(taskId, userId) : removeAssignee(taskId, userId));
    });
  }

  if (allProjects.length === 0) {
    return <Empty icon="🗂" title="No projects yet" sub="Create a project to get started" />;
  }

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

      <div className={cn(styles.board, isGlobal ? styles.boardGlobal : styles.boardProject)}>
        {STATUSES.filter((s) => s.id !== "archived").map((status) => {
          const tasks = allTasks.filter((t) => t.status === status.id);
          return (
            <div
              key={status.id}
              className={cn(styles.column, dragOverColumn === status.id && styles.columnDrag)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverColumn(status.id);
              }}
              onDragLeave={() => setDragOverColumn(null)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverColumn(null);
                if (drag) {
                  handleUpdateTaskStatus(drag, status.id);
                  setDrag(null);
                }
              }}
            >
              <div className={styles.colHead}>
                <span className={styles.colEmoji}>{status.emoji}</span>
                <span className={styles.colTitle}>{status.label}</span>
                <span className={cn(styles.count, COUNT_TONE[status.id] ?? styles.count_idea)}>{tasks.length}</span>
              </div>
              <div className={styles.colBody}>
                {tasks.map((task) => {
                  const tt = TASK_TYPES.find((t) => t.id === task.type) || TASK_TYPES[5];
                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={() => setDrag(task.id)}
                      onDragEnd={() => setDrag(null)}
                      onClick={() => setDetailTaskId(task.id)}
                      className={cn(styles.card, drag === task.id && styles.cardDragging)}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.cardTitle}>{task.title}</span>
                        <button
                          type="button"
                          className={styles.deleteBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task.id);
                          }}
                        >
                          ✕
                        </button>
                      </div>
                      <div className={styles.metaRow}>
                        <Badge size="sm">
                          {tt.icon} {tt.label}
                        </Badge>
                        {isGlobal && <span className={styles.projectChip}>{task._project.name}</span>}
                        {task.dueDate && <span className={styles.metaDate}>📅 {fmtDate(task.dueDate)}</span>}
                        {task.description && <span className={styles.metaDate}>📝</span>}
                      </div>
                      {task.assignees.length > 0 && (
                        <div className={styles.assignRow}>
                          {task.assignees.slice(0, 3).map((a) => (
                            <div key={a.user.id} className={styles.assignOverlap}>
                              <Avatar user={a.user} size={22} />
                            </div>
                          ))}
                          {task.assignees.length > 3 && (
                            <div className={styles.overflowAv}>+{task.assignees.length - 3}</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  className={styles.addTaskBtn}
                  onClick={() => {
                    setInitialStatus(status.id);
                    setShowTaskModal(true);
                  }}
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
        initialProjectId={isGlobal ? filterProjectId || allProjects[0]?.id : project?.id}
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
