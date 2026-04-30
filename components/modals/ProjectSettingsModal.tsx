"use client";

import { useState } from "react";
import { Modal, Btn, Avatar } from "@/components/ui";
import { PROJECT_ICONS } from "@/lib/constants";
import { generateInvite } from "@/lib/actions";

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 6 }}>{children}</div>;
}

type MemberUser = { id: string; name: string | null; email?: string | null; image: string | null };
type Member = { id: string; userId: string; role: string; user: MemberUser };

interface ProjectSettingsModalProps {
  projectId: string;
  name: string;
  description: string | null;
  iconId: string;
  members: Member[];
  currentUserId: string;
  onClose: () => void;
  onUpdate: (data: { name: string; description: string; iconId: string }) => Promise<void>;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export function ProjectSettingsModal({
  projectId,
  name: initialName,
  description: initialDesc,
  iconId: initialIcon,
  members,
  currentUserId,
  onClose,
  onUpdate,
  onRemoveMember,
}: ProjectSettingsModalProps) {
  const [tab, setTab] = useState<"settings" | "members" | "invite">("settings");
  const [name, setName] = useState(initialName);
  const [desc, setDesc] = useState(initialDesc || "");
  const [iconId, setIconId] = useState(initialIcon || "rocket");
  const [saving, setSaving] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const ROLE_LABEL: Record<string, string> = { OWNER: "Owner", ADMIN: "Admin", MEMBER: "Member", VIEWER: "Viewer" };

  async function handleGenerateInvite() {
    setGenerating(true);
    try {
      const result = await generateInvite(projectId, "MEMBER");
      setInviteLink(`${window.location.origin}/invite/${result.token}`);
    } finally {
      setGenerating(false);
    }
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "7px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 500,
        background: active ? "var(--accent-soft)" : "transparent",
    color: active ? "var(--accent-text)" : "var(--text2)",
  });

  return (
    <Modal open onClose={onClose} title="Project Settings" wide>
      {/* Tab bar */}
      <div style={{ display: "flex", gap: 2, background: "var(--surface2)", borderRadius: 8, padding: 3, marginBottom: 20 }}>
        {(["settings", "members", "invite"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={tabStyle(tab === t)}>
            {t === "settings" ? "Settings" : t === "members" ? `Members (${members.length})` : "Invite"}
          </button>
        ))}
      </div>

      {/* Settings tab */}
      {tab === "settings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <Label>Project name</Label>
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} />
          </div>
          <div>
            <Label>Project icon</Label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {PROJECT_ICONS.map((ic) => (
                <button
                  key={ic.id}
                  onClick={() => setIconId(ic.id)}
                  title={ic.id}
                  style={{
                    width: 38, height: 38, borderRadius: 8, fontSize: 18,
                    cursor: "pointer",
                    border: iconId === ic.id ? "2px solid var(--accent)" : "2px solid var(--border2)",
                    background: iconId === ic.id ? "var(--accent-soft)" : "var(--surface2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .12s",
                  }}
                >
                  {ic.emoji}
                </button>
              ))}
            </div>
          </div>
          <Btn
            onClick={async () => { setSaving(true); await onUpdate({ name, description: desc, iconId }); setSaving(false); }}
            disabled={!name.trim() || saving}
            size="lg"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Btn>
        </div>
      )}

      {/* Members tab */}
      {tab === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
              <Avatar user={m.user} size={34} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{m.user.name || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "var(--text3)" }}>{m.user.email || ""}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, background: "var(--accent-soft)", color: "var(--accent-text)", padding: "2px 9px", borderRadius: 20 }}>
                {ROLE_LABEL[m.role] || m.role}
              </span>
              {m.role !== "OWNER" && m.userId !== currentUserId && (
                <Btn variant="danger" size="sm" onClick={() => onRemoveMember(m.id)}>Remove</Btn>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Invite tab */}
      {tab === "invite" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ padding: "16px 18px", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text)" }}>Shareable invite link</div>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, lineHeight: 1.5 }}>
              Anyone with this link can join as a Member. Links expire in 7 days.
            </p>
            {!inviteLink ? (
              <Btn onClick={handleGenerateInvite} disabled={generating}>
                {generating ? "Generating..." : "Generate Link"}
              </Btn>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input value={inviteLink} readOnly style={{ flex: 1, fontSize: 12 }} onClick={(e) => (e.target as HTMLInputElement).select()} />
                <Btn variant="secondary" onClick={() => { navigator.clipboard.writeText(inviteLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                  {copied ? "Copied!" : "Copy"}
                </Btn>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
