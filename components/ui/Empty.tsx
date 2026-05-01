import { ReactNode } from "react";
import styles from "./Empty.module.css";

export function Empty({
  icon,
  title,
  sub,
  action,
}: {
  icon: string;
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.sub}>{sub}</p>
      {action}
    </div>
  );
}
