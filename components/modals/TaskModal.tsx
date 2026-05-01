"use client";

import { useState, useEffect } from "react";
import { TASK_TYPES, STATUSES } from "@/lib/constants";
import { Btn, Modal } from "@/components/ui";
import styles from "./TaskModal.module.css";

function Label({ children }: { children: React.ReactNode }) {
  return <div className={styles.label}>{children}</div>;
}

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    type: string;
    status: string;
    startDate: string;
    dueDate: string;
    projectId?: string;
  }) => Promise<void>;
  initialStatus?: string;
  projects?: Array<{ id: string; name: string }>;
  initialProjectId?: string;
}

export function TaskModal({
  open,
  onClose,
  onSave,
  initialStatus = "idea",
  projects,
  initialProjectId,
}: TaskModalProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("dev");
  const [status, setStatus] = useState(initialStatus);
  const [sd, setSd] = useState("");
  const [dd, setDd] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || projects?.[0]?.id || "");

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);
  useEffect(() => {
    setSelectedProjectId(initialProjectId || projects?.[0]?.id || "");
  }, [initialProjectId, projects]);

  const selectedProject = projects?.find((p) => p.id === selectedProjectId);

  return (
    <Modal open={open} onClose={onClose} title={`Add task${selectedProject ? ` → ${selectedProject.name}` : ""}`}>
      <div className={styles.stack}>
        {projects && projects.length > 0 && (
          <div>
            <Label>Project</Label>
            <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <Label>Task title</Label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus />
        </div>
        <div className={styles.grid2}>
          <div>
            <Label>Type</Label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {TASK_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.icon} {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Status</Label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.emoji} {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.grid2}>
          <div>
            <Label>Start</Label>
            <input type="date" value={sd} onChange={(e) => setSd(e.target.value)} />
          </div>
          <div>
            <Label>Due</Label>
            <input type="date" value={dd} onChange={(e) => setDd(e.target.value)} />
          </div>
        </div>
        <Btn
          onClick={async () => {
            if (!title.trim() || saving) return;
            setSaving(true);
            await onSave({
              title,
              type,
              status,
              startDate: sd,
              dueDate: dd,
              projectId: selectedProjectId || undefined,
            });
            setTitle("");
            setType("dev");
            setSd("");
            setDd("");
            setSaving(false);
            onClose();
          }}
          disabled={!title.trim() || saving}
          size="lg"
          fullWidth
          className={styles.justifyCenter}
        >
          {saving ? "Adding..." : "Add Task"}
        </Btn>
      </div>
    </Modal>
  );
}
