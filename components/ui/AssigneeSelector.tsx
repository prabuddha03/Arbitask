"use client";

import { Avatar } from "./Avatar";
import styles from "./AssigneeSelector.module.css";

function cn(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type MemberUser = { id: string; name: string | null; image: string | null };
type Member = { id: string; userId: string; role: string; user: MemberUser };

interface AssigneeSelectorProps {
  members: Member[];
  selectedUserIds: string[];
  onChange: (userId: string, selected: boolean) => void;
}

export function AssigneeSelector({ members, selectedUserIds, onChange }: AssigneeSelectorProps) {
  return (
    <div className={styles.row}>
      {members.map((m) => {
        const selected = selectedUserIds.includes(m.userId);
        return (
          <button
            key={m.userId}
            type="button"
            onClick={() => onChange(m.userId, !selected)}
            className={cn(styles.chip, selected && styles.chipSelected)}
          >
            <Avatar user={m.user} size={20} />
            {m.user.name || "Unknown"}
          </button>
        );
      })}
      {members.length === 0 && <span className={styles.empty}>No other members yet</span>}
    </div>
  );
}
