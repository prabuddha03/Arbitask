"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { stC, ThemeMode } from "@/lib/theme";
import styles from "./ThemeProvider.module.css";

interface ThemeCtx {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  cycleMode: () => void;
  stC: (id: string) => string;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

const MODE_ORDER: ThemeMode[] = ["dark", "light", "eye"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("dark");

  const cycleMode = useCallback(() => {
    setMode((m) => {
      const i = MODE_ORDER.indexOf(m);
      return MODE_ORDER[(i + 1) % MODE_ORDER.length];
    });
  }, []);

  const orbs =
    mode === "dark" ? (
      <>
        <div className={`${styles.orb} ${styles.orbDark1}`} aria-hidden />
        <div className={`${styles.orb} ${styles.orbDark2}`} aria-hidden />
        <div className={`${styles.orb} ${styles.orbDark3}`} aria-hidden />
      </>
    ) : mode === "light" ? (
      <>
        <div className={`${styles.orb} ${styles.orbLight1}`} aria-hidden />
        <div className={`${styles.orb} ${styles.orbLight2}`} aria-hidden />
      </>
    ) : (
      <>
        <div className={`${styles.orb} ${styles.orbEye1}`} aria-hidden />
        <div className={`${styles.orb} ${styles.orbEye2}`} aria-hidden />
      </>
    );

  return (
    <ThemeContext.Provider value={{ mode, setMode, cycleMode, stC }}>
      <div className={styles.root} data-theme={mode}>
        {orbs}
        <div className={styles.inner}>{children}</div>
      </div>
    </ThemeContext.Provider>
  );
}
