"use client";

import { PROJECT_ICONS, Stats } from "@/lib/constants";
import { signOutAction } from "@/lib/actions";
import { ThemeMode } from "@/lib/theme";
import styles from "./Sidebar.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function projectIcon(iconId: string) {
  return PROJECT_ICONS.find((i) => i.id === iconId)?.emoji ?? "📦";
}

const MODE_ICON: Record<ThemeMode, string> = {
  dark: "🌙",
  light: "☀️",
  eye: "👁",
};
const MODE_TITLE: Record<ThemeMode, string> = {
  dark: "Dark",
  light: "Light",
  eye: "Eye protection",
};

type Project = {
  id: string;
  name: string;
  colorId: string;
  tasks: Array<{ status: string }>;
};

interface SidebarProps {
  projects: Project[];
  activeProjectId?: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
  notesCount: number;
  mode: ThemeMode;
  onCycleMode: () => void;
  stats: Stats;
  user: { id: string; name: string | null; image: string | null };
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  activeView,
  onViewChange,
  notesCount,
  mode,
  onCycleMode,
  stats,
  user,
  collapsed,
  onToggleCollapse,
}: SidebarProps) {
  const views = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "teams", icon: "⎔", label: "Teams" },
    { id: "kanban", icon: "▦", label: "Kanban" },
    { id: "list", icon: "≡", label: "List" },
    { id: "timeline", icon: "⊟", label: "Timeline" },
    { id: "notes", icon: "✎", label: "Notes" },
    { id: "shipped", icon: "✦", label: "Shipped" },
  ];

  const globalViews = ["notes", "shipped", "dashboard", "teams"];

  if (collapsed) {
    return (
      <div className={cn(styles.sidebar, styles.collapsed)}>
        <div className={styles.headerCollapsed}>
          <div className={styles.logoMark}>A</div>
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Expand sidebar"
            className={styles.expandToggle}
          >
            »
          </button>
        </div>

        <div className={styles.modeRowCollapsed}>
          <button
            type="button"
            onClick={onCycleMode}
            title={`Switch to next mode (${MODE_TITLE[mode]})`}
            className={styles.modeBtn}
          >
            {MODE_ICON[mode]}
          </button>
        </div>

        <div className={styles.viewsCollapsed}>
          {views.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onViewChange(v.id)}
              title={v.label}
              className={cn(styles.viewIconBtn, activeView === v.id && styles.viewIconBtnActive)}
            >
              {v.icon}
            </button>
          ))}
        </div>

        <div className={styles.projectsCollapsed}>
          {projects.map((p) => {
            const isA = activeProjectId === p.id && !globalViews.includes(activeView);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p.id)}
                title={p.name}
                className={cn(styles.projectEmojiBtn, isA && styles.projectEmojiBtnActive)}
              >
                {projectIcon(p.colorId)}
              </button>
            );
          })}
          <button type="button" onClick={onNewProject} title="New project" className={styles.newProjectIconBtn}>
            +
          </button>
        </div>

        <div className={styles.userRowCollapsed}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name || ""} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>{user.name?.[0]?.toUpperCase() || "?"}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(styles.sidebar, styles.expanded)}>
      <div className={styles.headerExpanded}>
        <div className={styles.headerTop}>
          <div className={styles.brandRow}>
            <div className={styles.logoMark}>A</div>
            <div>
              <div className={styles.brandTitle}>Arbitask</div>
              <div className={styles.brandTag}>idea → shipped</div>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={onCycleMode}
              title={`Mode: ${MODE_TITLE[mode]}`}
              className={styles.headerIconBtn}
            >
              {MODE_ICON[mode]}
            </button>
            <button type="button" onClick={onToggleCollapse} title="Collapse sidebar" className={styles.headerIconBtn}>
              «
            </button>
          </div>
        </div>
      </div>

      <div className={styles.levelRow} onClick={() => onViewChange("dashboard")}>
        <span className={styles.levelEmoji}>{stats.currentLevel.emoji}</span>
        <div className={styles.levelMeta}>
          <div className={styles.levelLine}>
            Lv.{stats.currentLevel.level} {stats.currentLevel.title}
          </div>
          <svg className={styles.xpBar} viewBox="0 0 100 3" preserveAspectRatio="none" aria-hidden>
            <rect className={styles.xpBarTrack} x="0" y="0" width="100" height="3" rx="1.5" />
            <rect
              className={styles.xpBarFill}
              x="0"
              y="0"
              width={Math.max(0, Math.min(100, stats.levelProgress * 100))}
              height="3"
              rx="1.5"
            />
          </svg>
        </div>
        <span className={styles.xpLabel}>{stats.xp} XP</span>
      </div>

      <div className={styles.navSection}>
        <div className={styles.sectionLabel}>Views</div>
        {views.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onViewChange(v.id)}
            className={cn(styles.navButton, activeView === v.id && styles.navButtonActive)}
          >
            <span className={styles.navGlyph}>{v.icon}</span>
            {v.label}
            {v.id === "notes" && notesCount > 0 && <span className={styles.notesBadge}>{notesCount}</span>}
          </button>
        ))}
      </div>

      <div className={styles.projectsSection}>
        <div className={styles.sectionHeaderRow}>
          <span>Projects</span>
          <button type="button" onClick={onNewProject} className={styles.inlinePlus} title="New project">
            +
          </button>
        </div>
        {projects.map((p) => {
          const isA = activeProjectId === p.id && !globalViews.includes(activeView);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelectProject(p.id)}
              className={cn(styles.navButton, isA && styles.navButtonActive)}
            >
              <span className={styles.projectEmoji}>{projectIcon(p.colorId)}</span>
              <span className={styles.projectName}>{p.name}</span>
              <span className={styles.projectCount}>{p.tasks.length}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.userRow}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name || ""} className={styles.avatarImg} />
          ) : (
            <div className={styles.avatarFallback}>{user.name?.[0]?.toUpperCase() || "?"}</div>
          )}
          <span className={styles.userName}>{user.name || "You"}</span>
          <form action={signOutAction} className={styles.signOutForm}>
            <button type="submit" className={styles.signOutBtn}>
              Out
            </button>
          </form>
        </div>
        <button type="button" onClick={onNewProject} className={styles.newProjectCta}>
          <span>+</span> New project
        </button>
      </div>
    </div>
  );
}
