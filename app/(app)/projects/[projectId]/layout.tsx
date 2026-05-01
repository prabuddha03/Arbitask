"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import styles from "./project-layout.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const TABS = [
  { id: "overview",  label: "Overview",  icon: "◎" },
  { id: "kanban",   label: "Kanban",    icon: "🗂" },
  { id: "list",     label: "List",      icon: "📋" },
  { id: "timeline", label: "Timeline",  icon: "📅" },
  { id: "notes",    label: "Notes",     icon: "📝" },
  { id: "shipped",  label: "Shipped",   icon: "🚀" },
];

export default function ProjectLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = params?.projectId as string;

  function isActive(tabId: string) {
    return pathname.includes(`/${tabId}`);
  }

  return (
    <div className={styles.root}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => {
          const active = isActive(tab.id);
          return (
            <Link
              key={tab.id}
              href={`/projects/${projectId}/${tab.id}`}
              className={cn(styles.tab, active && styles.tabActive)}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      <div className={styles.content}>{children}</div>
    </div>
  );
}
