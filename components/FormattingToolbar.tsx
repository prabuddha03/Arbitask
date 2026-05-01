"use client";

import { RefObject } from "react";
import { TOOLBAR_ITEMS } from "@/lib/constants";
import styles from "./FormattingToolbar.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

interface FormattingToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (v: string) => void;
}

export function FormattingToolbar({ textareaRef, value, onChange }: FormattingToolbarProps) {
  const handleInsert = (item: (typeof TOOLBAR_ITEMS)[number]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.substring(start, end);
    let newText: string;
    let pos: number;
    if (item.wrap && selected) {
      newText = value.substring(0, start) + item.insert + selected + item.insert + value.substring(end);
      pos = end + item.insert.length * 2;
    } else if (item.wrap) {
      newText = value.substring(0, start) + item.insert + "text" + item.insert + value.substring(end);
      pos = start + item.insert.length;
    } else {
      newText = value.substring(0, start) + item.insert + value.substring(end);
      pos = start + item.insert.length;
    }
    onChange(newText);
    setTimeout(() => {
      ta.focus();
      ta.setSelectionRange(pos, item.wrap && !selected ? pos + 4 : pos);
    }, 10);
  };

  return (
    <div className={styles.toolbar}>
      {TOOLBAR_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleInsert(item)}
          title={item.title}
          className={cn(
            styles.toolBtn,
            item.id === "code" && styles.toolBtnCode,
            item.id === "italic" && styles.toolBtnItalic,
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
