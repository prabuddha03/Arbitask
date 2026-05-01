"use client";

import { PROJECT_ICONS, Stats } from "@/lib/constants";
import { signOutAction } from "@/lib/actions";
import { ThemeMode } from "@/lib/theme";

function projectIcon(iconId: string) {
  return PROJECT_ICONS.find((i) => i.id === iconId)?.emoji ?? "📦";
}

const MODE_ICON: Record<ThemeMode, string> = {
  dark:  "🌙",
  light: "☀️",
  eye:   "👁",
};
const MODE_TITLE: Record<ThemeMode, string> = {
  dark:  "Dark",
  light: "Light",
  eye:   "Eye protection",
};

type Project = {
  id: string;
  name: string;
  colorId: string; // stores icon id now
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
  projects, activeProjectId, onSelectProject, onNewProject,
  activeView, onViewChange, notesCount, mode, onCycleMode,
  stats, user, collapsed, onToggleCollapse,
}: SidebarProps) {
  const views = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "teams",     icon: "⎔", label: "Teams" },
    { id: "kanban",    icon: "▦", label: "Kanban" },
    { id: "list",      icon: "≡", label: "List" },
    { id: "timeline",  icon: "⊟", label: "Timeline" },
    { id: "notes",     icon: "✎", label: "Notes" },
    { id: "shipped",   icon: "✦", label: "Shipped" },
  ];

  const navBtn = (active: boolean, extraStyle?: React.CSSProperties): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: 9,
    width: "100%",
    padding: collapsed ? "9px 0" : "6px 10px",
    borderRadius: 7,
    border: active ? "1px solid var(--accent-glow)" : "1px solid transparent",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: active ? 600 : 400,
    marginBottom: 1,
    transition: "background .12s, color .12s, border-color .12s",
    background: active ? "var(--accent-soft)" : "transparent",
    color: active ? "var(--accent-text)" : "var(--text2)",
    ...extraStyle,
  });

  const sectionLabel: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: 1,
    color: "var(--text3)",
    padding: "0 10px 5px",
    textTransform: "uppercase" as const,
  };

  const sidebar: React.CSSProperties = {
    background: "var(--surface)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    boxShadow: "2px 0 16px rgba(0,0,0,0.06)",
  };

  // ── COLLAPSED ─────────────────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div style={{ ...sidebar, width: 52, minWidth: 52 }}>
        {/* Logo + expand */}
        <div style={{ padding: "14px 0 10px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #F07020 0%, #E8610A 60%, #C44800 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#FFF", fontWeight: 800, boxShadow: "0 3px 10px rgba(232,97,10,0.35)" }}>A</div>
          <button onClick={onToggleCollapse} title="Expand sidebar" style={{ background: "none", border: "none", borderRadius: 5, width: 28, height: 22, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>»</button>
        </div>

        {/* Mode toggle */}
        <div style={{ padding: "8px 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
          <button onClick={onCycleMode} title={`Switch to next mode (${MODE_TITLE[mode]})`} style={{ background: "none", border: "none", borderRadius: 6, width: 32, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {MODE_ICON[mode]}
          </button>
        </div>

        {/* Views */}
        <div style={{ padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          {views.map((v) => (
            <button key={v.id} onClick={() => onViewChange(v.id)} title={v.label}
              style={{ width: 34, height: 30, borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, background: activeView === v.id ? "var(--accent-soft)" : "transparent", color: activeView === v.id ? "var(--accent-text)" : "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {v.icon}
            </button>
          ))}
        </div>

        {/* Projects */}
        <div style={{ flex: 1, padding: "6px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, overflowY: "auto" }}>
          {projects.map((p) => {
            const isA = activeProjectId === p.id && !["notes", "shipped", "dashboard", "teams"].includes(activeView);
            return (
              <button key={p.id} onClick={() => onSelectProject(p.id)} title={p.name}
                style={{ width: 32, height: 32, borderRadius: 7, border: isA ? "1.5px solid var(--accent)" : "1.5px solid transparent", background: isA ? "var(--accent-soft)" : "transparent", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {projectIcon(p.colorId)}
              </button>
            );
          })}
          <button onClick={onNewProject} title="New project"
            style={{ width: 32, height: 32, borderRadius: 7, border: "1px dashed var(--border2)", background: "none", cursor: "pointer", fontSize: 16, color: "var(--text3)", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
        </div>

        {/* User avatar */}
        <div style={{ padding: "8px 0 10px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "center" }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name || ""} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent-text)" }}>
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── EXPANDED ───────────────────────────────────────────────────────────────
  return (
    <div style={{ ...sidebar, width: 240, minWidth: 240 }}>
      {/* Header */}
      <div style={{ padding: "16px 14px 14px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg, #F07020 0%, #E8610A 60%, #C44800 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#FFF", fontWeight: 800, boxShadow: "0 3px 10px rgba(232,97,10,0.35)", flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.3, color: "var(--text)" }}>Arbitask</div>
              <div style={{ fontSize: 10, color: "var(--text3)", fontWeight: 400 }}>idea → shipped</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={onCycleMode} title={`Mode: ${MODE_TITLE[mode]}`}
              style={{ background: "none", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>
              {MODE_ICON[mode]}
            </button>
            <button onClick={onToggleCollapse} title="Collapse sidebar"
              style={{ background: "none", border: "none", borderRadius: 6, width: 28, height: 28, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)" }}>«</button>
          </div>
        </div>
      </div>

      {/* Level bar */}
      <div
        style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
        onClick={() => onViewChange("dashboard")}
      >
        <span style={{ fontSize: 18 }}>{stats.currentLevel.emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text2)" }}>Lv.{stats.currentLevel.level} {stats.currentLevel.title}</div>
          <div style={{ width: "100%", height: 3, borderRadius: 2, background: "var(--surface3)", marginTop: 3 }}>
            <div style={{ width: `${stats.levelProgress * 100}%`, height: "100%", borderRadius: 2, background: "var(--accent)", transition: "width .5s ease" }} />
          </div>
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text3)" }}>{stats.xp} XP</span>
      </div>

      {/* Nav views */}
      <div style={{ padding: "10px 8px 4px" }}>
        <div style={sectionLabel}>Views</div>
        {views.map((v) => (
          <button key={v.id} onClick={() => onViewChange(v.id)} style={navBtn(activeView === v.id)}>
            <span style={{ fontSize: 13, width: 17, textAlign: "center", flexShrink: 0 }}>{v.icon}</span>
            {v.label}
            {v.id === "notes" && notesCount > 0 && (
              <span style={{ marginLeft: "auto", fontSize: 10, background: "var(--accent-soft)", color: "var(--accent-text)", padding: "1px 7px", borderRadius: 10, fontWeight: 600 }}>{notesCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div style={{ padding: "6px 8px", flex: 1, overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...sectionLabel, padding: "4px 10px 5px" }}>
          <span>Projects</span>
          <button onClick={onNewProject} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "0 2px" }} title="New project">+</button>
        </div>
        {projects.map((p) => {
          const isA = activeProjectId === p.id && !["notes", "shipped", "dashboard", "teams"].includes(activeView);
          return (
            <button key={p.id} onClick={() => onSelectProject(p.id)} style={navBtn(isA)}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{projectIcon(p.colorId)}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 11, color: "var(--text3)", flexShrink: 0 }}>{p.tasks.length}</span>
            </button>
          );
        })}
      </div>

      {/* User + sign out */}
      <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name || ""} style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
          ) : (
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--accent-text)", flexShrink: 0 }}>
              {user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}
          <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name || "You"}</span>
          <form action={signOutAction} style={{ display: "inline", flexShrink: 0 }}>
            <button type="submit" style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 11, fontWeight: 500, }}>Out</button>
          </form>
        </div>
        <button
          onClick={onNewProject}
          style={{ width: "100%", marginTop: 8, padding: "10px 14px", borderRadius: 8, border: "none", background: "linear-gradient(135deg, #F07020 0%, #E8610A 100%)", color: "#FFF", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 2px 10px rgba(232,97,10,0.28)", letterSpacing: 0.1 }}
        >
          <span>+</span> New project
        </button>
      </div>
    </div>
  );
}
