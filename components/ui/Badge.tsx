import { ReactNode } from "react";
import styles from "./Badge.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  children,
  size = "sm",
  className,
}: {
  children: ReactNode;
  /** Compact chip sizing for dense layouts */
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "xs" ? styles.size_xs : size === "md" ? undefined : styles.size_sm;
  return <span className={cn(styles.badge, sizeClass, className)}>{children}</span>;
}
