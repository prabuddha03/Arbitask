/**
 * @fileoverview Idempotent migration of legacy projects (no teamId) into workspace/team rows.
 */

import { db } from "@/lib/db";
import { Role } from "@/lib/constants";

export async function ensureTeamHierarchyBackfill(): Promise<void> {
  const orphans = await db.project.findMany({
    where: { teamId: null },
    include: { members: true, owner: { select: { id: true, name: true } } },
  });
  if (orphans.length === 0) return;

  for (const project of orphans) {
    const ownerId = project.ownerId;

    let workspace = await db.workspace.findFirst({
      where: { ownerId },
    });

    if (!workspace) {
      const label = project.owner?.name?.trim() || "Personal";
      workspace = await db.workspace.create({
        data: {
          name: `${label} workspace`,
          ownerId,
          members: {
            create: [{ userId: ownerId, role: Role.OWNER }],
          },
        },
      });
    } else {
      await db.workspaceMember.upsert({
        where: { workspaceId_userId: { workspaceId: workspace.id, userId: ownerId } },
        create: { workspaceId: workspace.id, userId: ownerId, role: Role.OWNER },
        update: {},
      });
    }

    const team = await db.team.create({
      data: {
        workspaceId: workspace.id,
        name: project.name,
        description: "Migrated from legacy project",
      },
    });

    await db.project.update({
      where: { id: project.id },
      data: { teamId: team.id },
    });

    for (const m of project.members) {
      await db.teamMember.upsert({
        where: { teamId_userId: { teamId: team.id, userId: m.userId } },
        create: { teamId: team.id, userId: m.userId, role: m.role },
        update: { role: m.role },
      });
      if (m.userId !== ownerId) {
        await db.workspaceMember.upsert({
          where: { workspaceId_userId: { workspaceId: workspace.id, userId: m.userId } },
          create: { workspaceId: workspace.id, userId: m.userId, role: Role.MEMBER },
          update: {},
        });
      }
    }

    await db.teamMember.upsert({
      where: { teamId_userId: { teamId: team.id, userId: ownerId } },
      create: { teamId: team.id, userId: ownerId, role: Role.OWNER },
      update: {},
    });
  }
}
