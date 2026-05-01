import { auth } from "./auth";
import { Role } from "@/lib/constants";
import { NextResponse } from "next/server";
import { ApiErrors } from "@/lib/middlewares";
import {
  getEffectiveProjectMember,
  isAtLeastAdmin,
  isAtLeastMember,
  isOwner,
  type EffectiveProjectMember,
} from "@/src/modules/rbac/rbac.service";

export async function getSession() {
  return auth();
}

export function isMember(v: unknown): v is EffectiveProjectMember {
  return typeof v === "object" && v !== null && "role" in v;
}

export async function requireProjectMember(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return member;
}

export async function requireProjectAdmin(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isAtLeastAdmin(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return member;
}

export async function requireProjectContributor(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isAtLeastMember(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return member;
}

export async function requireProjectOwner(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isOwner(member.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return member;
}

export async function assertProjectMember(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member) throw ApiErrors.Forbidden("You are not a project member");
  return member;
}

export async function assertProjectAdmin(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isAtLeastAdmin(member.role)) {
    throw ApiErrors.Forbidden("Admin or Owner role required");
  }
  return member;
}

export async function assertProjectContributor(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isAtLeastMember(member.role)) {
    throw ApiErrors.Forbidden("Member role or higher required for this action");
  }
  return member;
}

export async function assertProjectOwner(projectId: string, userId: string) {
  const member = await getEffectiveProjectMember(projectId, userId);
  if (!member || !isOwner(member.role)) {
    throw ApiErrors.Forbidden("Project owner role required");
  }
  return member;
}
