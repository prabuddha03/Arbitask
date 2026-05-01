import { TASK_TYPES } from "@/lib/constants";
import { fmtDate } from "@/lib/helpers";
import { Badge, Empty } from "@/components/ui";
import styles from "./ShippedView.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Task = {
  id: string;
  title: string;
  type: string;
  status: string;
  dueDate: Date | null;
};

type Project = {
  id: string;
  name: string;
  colorId: string;
  tasks: Task[];
};

interface ShippedViewProps {
  projects: Project[];
}

const STAT_ROWS: Array<{ l: string; k: "done" | "planned" | "accent" | "idea"; i: string }> = [
  { l: "Shipped", k: "done", i: "🚀" },
  { l: "Total", k: "planned", i: "📋" },
  { l: "Projects", k: "accent", i: "📂" },
  { l: "Done %", k: "idea", i: "📊" },
];

export function ShippedView({ projects }: ShippedViewProps) {
  const shipped = projects
    .flatMap((p) =>
      p.tasks
        .filter((t) => t.status === "done")
        .map((t) => ({ ...t, pName: p.name, pColorId: p.colorId })),
    )
    .sort((a, b) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime());

  const totalDone = shipped.length;
  const totalTasks = projects.reduce((s, p) => s + p.tasks.length, 0);

  const values = [
    totalDone,
    totalTasks,
    projects.length,
    totalTasks ? `${Math.round((totalDone / totalTasks) * 100)}%` : "0%",
  ];

  return (
    <div className={styles.wrap}>
      <div className={styles.statsGrid}>
        {STAT_ROWS.map((s, i) => (
          <div key={s.l} className={styles.statCard}>
            <div className={styles.statIcon}>{s.i}</div>
            <div
              className={cn(
                styles.statValue,
                s.k === "done" && styles.statValueDone,
                s.k === "planned" && styles.statValuePlanned,
                s.k === "accent" && styles.statValueAccent,
                s.k === "idea" && styles.statValueIdea,
              )}
            >
              {values[i]}
            </div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>
      {!shipped.length ? (
        <Empty icon="🎯" title="Nothing shipped yet" sub="Complete tasks to see them here" />
      ) : (
        <div className={styles.list}>
          {shipped.map((task) => {
            const tt = TASK_TYPES.find((t) => t.id === task.type) || TASK_TYPES[5];
            return (
              <div key={task.id} className={styles.row}>
                <div className={styles.check}>✅</div>
                <div className={styles.main}>
                  <div className={styles.title}>{task.title}</div>
                  <div className={styles.metaRow}>
                    <Badge size="sm">{task.pName}</Badge>
                    <Badge size="sm">
                      {tt.icon} {tt.label}
                    </Badge>
                  </div>
                </div>
                {task.dueDate && <span className={styles.due}>{fmtDate(task.dueDate)}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
