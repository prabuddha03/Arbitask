// Replaces Prisma enums with app-level constants
export const Role = { OWNER: "OWNER", ADMIN: "ADMIN", MEMBER: "MEMBER", VIEWER: "VIEWER" } as const;
export type Role = (typeof Role)[keyof typeof Role];

export const InviteStatus = { PENDING: "PENDING", ACCEPTED: "ACCEPTED", EXPIRED: "EXPIRED" } as const;
export type InviteStatus = (typeof InviteStatus)[keyof typeof InviteStatus];

export const TASK_TYPES = [
  { id: "design", label: "Design", icon: "◆" },
  { id: "dev", label: "Dev", icon: "⚡" },
  { id: "research", label: "Research", icon: "◎" },
  { id: "content", label: "Content", icon: "✦" },
  { id: "marketing", label: "Marketing", icon: "▲" },
  { id: "other", label: "Other", icon: "●" },
];

export const STATUSES = [
  { id: "idea", label: "Idea", emoji: "💡" },
  { id: "planned", label: "Planned", emoji: "📋" },
  { id: "in_progress", label: "In Progress", emoji: "🔥" },
  { id: "blocked", label: "Blocked", emoji: "🚧" },
  { id: "done", label: "Done", emoji: "✅" },
  { id: "archived", label: "Archived", emoji: "📦" },
];

// kept for DB backward compat (colorId field stores icon id now)
export const PROJECT_COLORS = [
  { id: "rose", hex: "#F43F5E", lightText: "#9F1239" },
];

export const PROJECT_STATUSES = [
  { id: "backlog",     label: "Backlog",     icon: "○", color: "#8C8070" },
  { id: "in_progress", label: "In Progress", icon: "◐", color: "#E8610A" },
  { id: "on_track",   label: "On Track",    icon: "◉", color: "#22C55E" },
  { id: "at_risk",    label: "At Risk",     icon: "⚠", color: "#FBBF24" },
  { id: "completed",  label: "Completed",   icon: "●", color: "#4ADE80" },
  { id: "cancelled",  label: "Cancelled",   icon: "✕", color: "#6B7280" },
];

export const PROJECT_PRIORITIES = [
  { id: "no_priority", label: "No priority", icon: "···" },
  { id: "urgent",      label: "Urgent",      icon: "🔴" },
  { id: "high",        label: "High",        icon: "🔶" },
  { id: "medium",      label: "Medium",      icon: "🔵" },
  { id: "low",         label: "Low",         icon: "⚪" },
];

export const PROJECT_ICONS = [
  { id: "rocket",   emoji: "🚀" },
  { id: "idea",     emoji: "💡" },
  { id: "lightning",emoji: "⚡" },
  { id: "target",   emoji: "🎯" },
  { id: "fire",     emoji: "🔥" },
  { id: "code",     emoji: "💻" },
  { id: "brain",    emoji: "🧠" },
  { id: "chart",    emoji: "📈" },
  { id: "design",   emoji: "🎨" },
  { id: "globe",    emoji: "🌐" },
  { id: "shield",   emoji: "🛡️" },
  { id: "gear",     emoji: "⚙️" },
  { id: "book",     emoji: "📚" },
  { id: "leaf",     emoji: "🌿" },
  { id: "gem",      emoji: "💎" },
  { id: "magic",    emoji: "🔮" },
  { id: "box",      emoji: "📦" },
  { id: "star",     emoji: "⭐" },
  { id: "build",    emoji: "🏗️" },
  { id: "sparkle",  emoji: "✨" },
];


export const SLASH_COMMANDS = [
  { id: "h1", label: "Heading 1", desc: "Large heading", icon: "H1", insert: "# " },
  { id: "h2", label: "Heading 2", desc: "Medium heading", icon: "H2", insert: "## " },
  { id: "h3", label: "Heading 3", desc: "Small heading", icon: "H3", insert: "### " },
  { id: "bullet", label: "Bullet List", desc: "Unordered list item", icon: "•", insert: "- " },
  { id: "number", label: "Numbered List", desc: "Ordered list item", icon: "1.", insert: "1. " },
  { id: "todo", label: "To-do", desc: "Checkbox item", icon: "☐", insert: "- [ ] " },
  { id: "quote", label: "Quote", desc: "Block quote", icon: "❝", insert: "> " },
  { id: "code", label: "Code Block", desc: "Code snippet", icon: "</>", insert: "```\n\n```" },
  { id: "divider", label: "Divider", desc: "Horizontal rule", icon: "—", insert: "\n---\n" },
  { id: "bold", label: "Bold", desc: "Bold text", icon: "B", insert: "**text**" },
  { id: "italic", label: "Italic", desc: "Italic text", icon: "I", insert: "*text*" },
  { id: "callout", label: "Callout", desc: "Highlighted note", icon: "💡", insert: "> 💡 " },
];

export const TOOLBAR_ITEMS = [
  { id: "bold", label: "B", title: "Bold", insert: "**", wrap: true },
  { id: "italic", label: "I", title: "Italic", insert: "*", wrap: true },
  { id: "h1", label: "H1", title: "Heading 1", insert: "# ", wrap: false },
  { id: "h2", label: "H2", title: "Heading 2", insert: "## ", wrap: false },
  { id: "bullet", label: "•", title: "Bullet list", insert: "- ", wrap: false },
  { id: "number", label: "1.", title: "Numbered list", insert: "1. ", wrap: false },
  { id: "todo", label: "☐", title: "To-do", insert: "- [ ] ", wrap: false },
  { id: "quote", label: "❝", title: "Quote", insert: "> ", wrap: false },
  { id: "code", label: "</>", title: "Code", insert: "`", wrap: true },
  { id: "hr", label: "—", title: "Divider", insert: "\n---\n", wrap: false },
];

export const LEVELS = [
  { level: 1, title: "Dreamer", emoji: "💭", minXP: 0, color: "#94A3B8" },
  { level: 2, title: "Tinkerer", emoji: "🔧", minXP: 100, color: "#60A5FA" },
  { level: 3, title: "Builder", emoji: "🏗️", minXP: 250, color: "#34D399" },
  { level: 4, title: "Maker", emoji: "⚡", minXP: 500, color: "#FBBF24" },
  { level: 5, title: "Shipper", emoji: "🚀", minXP: 800, color: "#F97316" },
  { level: 6, title: "Machine", emoji: "🤖", minXP: 1200, color: "#EC4899" },
  { level: 7, title: "Legend", emoji: "👑", minXP: 1800, color: "#A78BFA" },
  { level: 8, title: "Mythic", emoji: "🔱", minXP: 2500, color: "#F43F5E" },
];

export type Stats = {
  totalTasks: number;
  done: number;
  inProgress: number;
  blocked: number;
  planned: number;
  ideas: number;
  projects: number;
  notes: number;
  projectsWithTasks: number;
  maxDoneInProject: number;
  hasCleanProject: boolean;
  xp: number;
  currentLevel: typeof LEVELS[number];
  nextLevel: typeof LEVELS[number] | null;
  xpInLevel: number;
  xpNeeded: number;
  levelProgress: number;
  completionRate: number;
};

export const ACHIEVEMENTS: Array<{ id: string; title: string; desc: string; emoji: string; check: (s: Stats) => boolean }> = [
  { id: "first_blood", title: "First Blood", desc: "Complete your first task", emoji: "⚔️", check: (s) => s.done >= 1 },
  { id: "hat_trick", title: "Hat Trick", desc: "Complete 3 tasks in one project", emoji: "🎩", check: (s) => s.maxDoneInProject >= 3 },
  { id: "note_taker", title: "Note Taker", desc: "Write 3 or more notes", emoji: "📝", check: (s) => s.notes >= 3 },
  { id: "idea_machine", title: "Idea Machine", desc: "Create 3+ projects", emoji: "💡", check: (s) => s.projects >= 3 },
  { id: "prolific", title: "Prolific", desc: "Create 10+ tasks total", emoji: "📋", check: (s) => s.totalTasks >= 10 },
  { id: "speed_demon", title: "Speed Demon", desc: "Complete 5 tasks", emoji: "⚡", check: (s) => s.done >= 5 },
  { id: "centurion", title: "Centurion", desc: "Earn 100+ XP", emoji: "🏛️", check: (s) => s.xp >= 100 },
  { id: "half_k", title: "Half K", desc: "Earn 500+ XP", emoji: "🔥", check: (s) => s.xp >= 500 },
  { id: "grand", title: "Grand Master", desc: "Earn 1000+ XP", emoji: "👑", check: (s) => s.xp >= 1000 },
  { id: "multi_thread", title: "Multi-threader", desc: "Have tasks in 3+ projects", emoji: "🧵", check: (s) => s.projectsWithTasks >= 3 },
  { id: "planner", title: "Planner", desc: "Have 5+ planned tasks", emoji: "🗓️", check: (s) => s.planned >= 5 },
  { id: "on_fire", title: "On Fire", desc: "Have 3+ tasks in progress", emoji: "🔥", check: (s) => s.inProgress >= 3 },
  { id: "clean_slate", title: "Clean Slate", desc: "Complete all tasks in a project", emoji: "✨", check: (s) => s.hasCleanProject },
  { id: "ten_down", title: "Ten Down", desc: "Complete 10 tasks", emoji: "🏆", check: (s) => s.done >= 10 },
  { id: "wordsmith", title: "Wordsmith", desc: "Write 5+ notes", emoji: "✍️", check: (s) => s.notes >= 5 },
];
