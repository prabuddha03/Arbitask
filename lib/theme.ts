export type ThemeMode = "dark" | "light" | "eye";

/** Status column / badge color — resolves against theme tokens in `app/globals.css`. */
export const stC = (id: string) => `var(--st-${id})`;
