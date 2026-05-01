"use client";

import { ReactNode } from "react";
import styles from "./Btn.module.css";

interface BtnProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  disabled,
  type = "button",
}: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        styles.btn,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        className,
      )}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}
