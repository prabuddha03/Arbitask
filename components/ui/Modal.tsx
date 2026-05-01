"use client";

import { ReactNode } from "react";
import styles from "./Modal.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Modal({
  open,
  onClose,
  title,
  children,
  wide,
  fullscreen,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  wide?: boolean;
  fullscreen?: boolean;
}) {
  if (!open) return null;
  return (
    <div
      className={cn(styles.backdrop, fullscreen && styles.backdropFullscreen)}
      onClick={onClose}
    >
      <div
        className={cn(styles.panel, "fi", wide && styles.panelWide, fullscreen && styles.panelFullscreen)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className={styles.headerRow}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" onClick={onClose} className={styles.closeBtn}>
              ✕
            </button>
          </div>
        )}
        <div className={fullscreen ? styles.bodyGrow : undefined}>{children}</div>
      </div>
    </div>
  );
}
