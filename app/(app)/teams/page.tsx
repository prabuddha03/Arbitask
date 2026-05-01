"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./teams-page.module.css";

type WorkspaceRow = {
  id: string;
  name: string;
  teams: Array<{ id: string; name: string; parentTeamId: string | null }>;
};

export default function TeamsPage() {
  const [workspaces, setWorkspaces] = useState<WorkspaceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wsName, setWsName] = useState("");
  const [teamWorkspaceId, setTeamWorkspaceId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [savingWs, setSavingWs] = useState(false);
  const [savingTeam, setSavingTeam] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workspaces");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Failed to load workspaces");
      setWorkspaces(json.data as WorkspaceRow[]);
      const first = (json.data as WorkspaceRow[])?.[0]?.id;
      if (first) setTeamWorkspaceId((id) => id || first);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createWorkspace() {
    if (!wsName.trim() || savingWs) return;
    setSavingWs(true);
    setError(null);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: wsName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Could not create workspace");
      setWsName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingWs(false);
    }
  }

  async function createTeam() {
    if (!teamName.trim() || !teamWorkspaceId || savingTeam) return;
    setSavingTeam(true);
    setError(null);
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: teamWorkspaceId, name: teamName.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error?.message || "Could not create team");
      setTeamName("");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSavingTeam(false);
    }
  }

  return (
    <div className={styles.page}>
      <p className={styles.eyebrow}>Workspace → Teams → Projects</p>
      <h1 className={styles.title}>Teams &amp; workspaces</h1>
      <p className={styles.lead}>
        Create a workspace, then teams under it. New projects must pick a team where you have Member access or
        higher.
      </p>

      {error ? <p className={styles.error}>{error}</p> : null}

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>New workspace</h2>
        <div className={styles.row}>
          <input
            className={styles.input}
            placeholder="Workspace name"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
          />
          <button type="button" className={styles.btn} disabled={!wsName.trim() || savingWs} onClick={() => void createWorkspace()}>
            {savingWs ? "Saving…" : "Create"}
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>New team</h2>
        <div className={styles.row}>
          <select
            className={styles.input}
            value={teamWorkspaceId}
            onChange={(e) => setTeamWorkspaceId(e.target.value)}
            aria-label="Workspace"
          >
            <option value="">Select workspace</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            placeholder="Team name"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
          />
          <button
            type="button"
            className={styles.btn}
            disabled={!teamName.trim() || !teamWorkspaceId || savingTeam}
            onClick={() => void createTeam()}
          >
            {savingTeam ? "Saving…" : "Create team"}
          </button>
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={styles.cardTitle}>Your workspaces</h2>
        {loading ? (
          <p className={styles.meta}>Loading…</p>
        ) : workspaces.length === 0 ? (
          <p className={styles.meta}>
            No workspaces yet. Create one above, or open an existing project once so legacy data can sync into teams.
          </p>
        ) : (
          <ul className={styles.list}>
            {workspaces.map((w) => (
              <li key={w.id} className={styles.listItem}>
                <span className={styles.strong}>{w.name}</span>
                <div className={styles.meta}>
                  {w.teams.length === 0
                    ? "No teams yet"
                    : `${w.teams.length} team(s): ${w.teams.map((t) => t.name).join(", ")}`}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
