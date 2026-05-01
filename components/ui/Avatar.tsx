import styles from "./Avatar.module.css";

const SIZE_CLASS: Record<number, string> = {
  20: styles.size_20,
  22: styles.size_22,
  24: styles.size_24,
  34: styles.size_34,
};

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Avatar({
  user,
  size = 24,
}: {
  user: { name?: string | null; image?: string | null };
  size?: 20 | 22 | 24 | 34;
}) {
  const sz = SIZE_CLASS[size] ?? styles.size_24;
  if (user.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={user.image} alt={user.name || ""} className={cn(styles.img, sz)} />
    );
  }
  return (
    <div className={cn(styles.fallback, sz)}>
      {user.name?.[0]?.toUpperCase() || "?"}
    </div>
  );
}
