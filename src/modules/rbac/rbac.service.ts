/**
 * @fileoverview Effective project access from project + team membership.
 */

import { db } from "@/lib/db";
import { Role } from "@/lib/constants";

const RANK: Record<string, number> = {
  [Role.VIEWER]: 1,
  [Role.MEMBER]: 2,
  [Role.ADMIN]: 3,
  [Role.OWNER]: 4,
};

function rankOf(role: string): number {
  return RANK[role] ?? 0;
}

function maxRole(a: string, b: string): string {
  return rankOf(a) >= rankOf(b) ? a : b;
}

/** Compatible with legacy `isMember()` checks on `.role` */
export type EffectiveProjectMember = {
  id: string;
  role: string;
  projectId: string;
  userId: string;
  joinedAt: Date;
  accessSource: "project" | "team";
};

export async function getEffectiveProjectMember(
  projectId: string,
  userId: string
): Promise<EffectiveProjectMember | null> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, teamId: true },
  });
  if (!project) return null;

  const [pm, tm] = await Promise.all([
    db.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    }),
    project.teamId
      ? db.teamMember.findUnique({
          where: { teamId_userId: { teamId: project.teamId, userId } },
        })
      : Promise.resolve(null),
  ]);

  if (!pm && !tm) return null;

  const role = pm && tm ? maxRole(pm.role, tm.role) : pm ? pm.role : tm!.role;
  const joinedAt = pm?.joinedAt ?? tm?.joinedAt ?? new Date();
  const id = pm?.id ?? `team:${tm!.id}`;
  const accessSource: "project" | "team" = pm ? "project" : "team";

  return { id, role, projectId, userId, joinedAt, accessSource };
}

export function isAtLeastAdmin(role: string): boolean {
  return rankOf(role) >= rankOf(Role.ADMIN);
}

export function isAtLeastMember(role: string): boolean {
  return rankOf(role) >= rankOf(Role.MEMBER);
}

export function isOwner(role: string): boolean {
  return role === Role.OWNER;
}
