"use client";

import { ReactNode, useState, useTransition } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ThemeProvider, useTheme } from "@/components/providers/ThemeProvider";
import { Sidebar } from "@/components/Sidebar";
import { ProjectModal } from "@/components/modals/ProjectModal";
import { ProjectSettingsModal } from "@/components/modals/ProjectSettingsModal";
import { TaskModal } from "@/components/modals/TaskModal";
import { Stats } from "@/lib/constants";
import { createTask, createProject, updateProject, removeMember } from "@/lib/actions";
import styles from "./AppShell.module.css";

type TaskUser = { id: string; name: string | null; image: string | null };
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
type Member = { id: string; role: string; userId: string; user: TaskUser };
type Project = {
  id: string;
  name: string;
  description: string | null;
  colorId: string;
  status: string;
  priority: string;
  startDate: Date | null;
  targetDate: Date | null;
  teamId: string | null;
  createdAt: Date;
  ownerId: string;
  tasks: Task[];
  members: Member[];
};

interface AppShellProps {
  projects: Project[];
  stats: Stats;
  user: { id: string; name: string | null; image: string | null };
  children: ReactNode;
}

const VIEW_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  teams:     "Teams & workspaces",
  overview:  "Overview",
  kanban:    "Kanban Board",
  list:      "List View",
  timeline:  "Timeline",
  notes:     "Notes",
  shipped:   "What I Shipped",
};

function Shell({ projects, stats, user, children }: AppShellProps) {
  const { mode, cycleMode } = useTheme();
  const [, startTransition] = useTransition();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showProjectSettings, setShowProjectSettings] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const projectId = params?.projectId as string | undefined;

  function getView() {
    if (pathname.startsWith("/teams")) return "teams";
    if (pathname.includes("/overview")) return "overview";
    if (pathname.includes("/kanban"))   return "kanban";
    if (pathname.includes("/list"))     return "list";
    if (pathname.includes("/timeline")) return "timeline";
    if (pathname.includes("/notes"))    return "notes";
    if (pathname.includes("/shipped"))  return "shipped";
    return "dashboard";
  }

  function onViewChange(view: string) {
    if (view === "teams") router.push("/teams");
    else router.push(`/${view}`);
  }

  function onSelectProject(pid: string) {
    router.push(`/projects/${pid}/overview`);
  }

  const activeProject = projectId ? projects.find((p) => p.id === projectId) : null;
  const currentView = getView();
  const isGlobal =
    !pathname.includes("/projects/") ||
    ["dashboard", "notes", "shipped", "teams"].includes(currentView);

  return (
    <div className={styles.layout}>
      <Sidebar
        projects={projects}
        activeProjectId={projectId}
        onSelectProject={onSelectProject}
        onNewProject={() => setShowNewProject(true)}
        activeView={currentView}
        onViewChange={onViewChange}
        notesCount={0}
        mode={mode}
        onCycleMode={cycleMode}
        stats={stats}
        user={user}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      <div className={styles.main}>
        {/* Top header */}
        <div className={styles.header}>
          <div className={styles.headerTitleBlock}>
            <h1 className={styles.title}>
              {isGlobal ? VIEW_LABELS[currentView] : activeProject?.name || "Select a project"}
            </h1>
            {activeProject && !isGlobal && (
              <p className={styles.subtitle}>
                {activeProject.description ? `${activeProject.description} · ` : ""}{VIEW_LABELS[currentView]}
              </p>
            )}
          </div>
          <div className={styles.actions}>
            {!isGlobal && activeProject && (
              <button
                type="button"
                onClick={() => setShowProjectSettings(true)}
                title="Project settings"
                className={styles.settingsBtn}
              >
                ···
              </button>
            )}
            {projects.length > 0 && (
              <button type="button" onClick={() => setShowAddTask(true)} className={styles.addTaskBtn}>
                + Add Task
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className={styles.content}>{children}</div>
      </div>

      {showAddTask && (
        <TaskModal
          open={showAddTask}
          onClose={() => setShowAddTask(false)}
          projects={projects.map((p) => ({ id: p.id, name: p.name }))}
          initialProjectId={activeProject?.id}
          onSave={async (data) => {
            const pid = data.projectId || activeProject?.id;
            if (!pid) return;
            setShowAddTask(false);
            startTransition(() => { void createTask({ projectId: pid, title: data.title, type: data.type, status: data.status, startDate: data.startDate || null, dueDate: data.dueDate || null }); });
          }}
        />
      )}

      {showNewProject && (
        <ProjectModal
          onClose={() => setShowNewProject(false)}
          onSave={async (proj) => {
            if (!proj.teamId) return;
            const project = await createProject({
              teamId: proj.teamId,
              name: proj.name,
              description: proj.description,
              colorId: proj.colorId,
              status: proj.status,
              priority: proj.priority,
              lead: proj.lead,
              startDate: proj.startDate,
              targetDate: proj.targetDate,
            });
            setShowNewProject(false);
            router.push(`/projects/${project.id}/kanban`);
          }}
        />
      )}

      {showProjectSettings && activeProject && (
        <ProjectSettingsModal
          projectId={activeProject.id}
          name={activeProject.name}
          description={activeProject.description}
          iconId={activeProject.colorId}
          members={activeProject.members}
          currentUserId={user.id}
          onClose={() => setShowProjectSettings(false)}
          onUpdate={async (updates) => {
            setShowProjectSettings(false);
            startTransition(() => { void updateProject(activeProject.id, { name: updates.name, description: updates.description, colorId: updates.iconId }); });
          }}
          onRemoveMember={async (memberId) => {
            startTransition(() => { void removeMember(memberId); });
          }}
        />
      )}
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <ThemeProvider>
      <Shell {...props} />
    </ThemeProvider>
  );
}
