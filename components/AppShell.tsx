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
    <div style={{ display: "flex", width: "100%", height: "100%" }}>
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Top header */}
        <div style={{ padding: "13px 24px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--surface)", flexShrink: 0, boxShadow: "0 1px 0 var(--border)" }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, color: "var(--text)" }}>
              {isGlobal ? VIEW_LABELS[currentView] : activeProject?.name || "Select a project"}
            </h1>
            {activeProject && !isGlobal && (
              <p style={{ fontSize: 11.5, color: "var(--text3)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {activeProject.description ? `${activeProject.description} · ` : ""}{VIEW_LABELS[currentView]}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {!isGlobal && activeProject && (
              <button
                onClick={() => setShowProjectSettings(true)}
                title="Project settings"
                style={{ background: "var(--surface2)", border: "1px solid var(--border2)", borderRadius: 7, padding: "6px 11px", fontSize: 14, cursor: "pointer", color: "var(--text2)", lineHeight: 1 }}
              >
                ···
              </button>
            )}
            {projects.length > 0 && (
              <button
                onClick={() => setShowAddTask(true)}
                style={{ background: "linear-gradient(135deg, #F07020 0%, #E8610A 100%)", color: "#FFF", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 10px rgba(232,97,10,0.30)", letterSpacing: 0.1 }}
              >
                + Add Task
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex: 1, overflow: "auto", padding: 24, minHeight: 0 }}>
          {children}
        </div>
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
