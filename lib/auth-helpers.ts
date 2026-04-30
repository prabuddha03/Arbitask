import { auth } from "./auth";
import { db } from "./db";
import { Role } from "@/lib/constants";
import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/middlewares";

export async function getSession() {
  return auth();
}

/** Returns the ProjectMember row if user is a member, else returns a 401/403 Response */
export async function requireProjectMember(projectId: string, userId: string) {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return member;
}

/** Returns the ProjectMember row if user is OWNER or ADMIN, else 403 */
export async function requireProjectAdmin(projectId: string, userId: string) {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member || (member.role !== Role.OWNER && member.role !== Role.ADMIN)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return member;
}

/** Type guard — narrows NextResponse vs actual member */
export function isMember(v: unknown): v is { id: string; role: string; projectId: string; userId: string; joinedAt: Date } {
  return typeof v === "object" && v !== null && "role" in v;
}

// ─── Throwing variants (used by refactored thin API routes) ──────────────────

/** Like requireProjectMember but throws ApiError instead of returning a Response */
export async function assertProjectMember(projectId: string, userId: string) {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member) throw ApiErrors.Forbidden("You are not a project member");
  return member;
}

/** Like requireProjectAdmin but throws ApiError instead of returning a Response */
export async function assertProjectAdmin(projectId: string, userId: string) {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!member || (member.role !== Role.OWNER && member.role !== Role.ADMIN)) {
    throw ApiErrors.Forbidden("Admin or Owner role required");
  }
  return member;
}
