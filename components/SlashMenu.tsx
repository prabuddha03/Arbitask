"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { SLASH_COMMANDS } from "@/lib/constants";
import styles from "./SlashMenu.module.css";

interface SlashMenuProps {
  position: { x: number; y: number };
  filter: string;
  onSelect: (cmd: (typeof SLASH_COMMANDS)[number]) => void;
  onClose: () => void;
}

export function SlashMenu({ position, filter, onSelect, onClose }: SlashMenuProps) {
  const [ai, setAi] = useState(0);
  const filtered = SLASH_COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(filter.toLowerCase()) ||
      c.desc.toLowerCase().includes(filter.toLowerCase()),
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAi(0);
  }, [filter]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.left = `${position.x}px`;
    el.style.top = `${position.y}px`;
  }, [position]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setAi((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setAi((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter" && filtered[ai]) {
        e.preventDefault();
        onSelect(filtered[ai]);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [filtered, ai, onSelect, onClose]);

  if (!filtered.length) return null;

  return (
    <div className="sm" ref={ref}>
      {filtered.map((cmd, i) => (
        <button
          key={cmd.id}
          type="button"
          className={`si ${i === ai ? "ac" : ""}`}
          onMouseEnter={() => setAi(i)}
          onClick={() => onSelect(cmd)}
        >
          <span className="sic">{cmd.icon}</span>
          <div>
            <div className={styles.cmdTitle}>{cmd.label}</div>
            <div className={styles.cmdDesc}>{cmd.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
