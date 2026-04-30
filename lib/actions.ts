"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { signOut, signIn } from "./auth";
import { db } from "./db";
import { Role } from "@/lib/constants";
import { projectService } from "@/src/modules/projects/project.service";
import { taskService } from "@/src/modules/tasks/task.service";
import { noteService } from "@/src/modules/notes/note.service";
import { memberService } from "@/src/modules/members/member.service";
import { inviteService } from "@/src/modules/invites/invite.service";
import { assigneeService } from "@/src/modules/assignees/assignee.service";
import { isMember, requireProjectAdmin, requireProjectMember } from "./auth-helpers";

// ============================================
// Auth Actions
// ============================================

export async function signOutAction() {
  await signOut({ redirectTo: "/login" });
}

export async function signInWithGoogle(callbackUrl?: string) {
  await signIn("google", { redirectTo: callbackUrl || "/dashboard" });
}

export async function signInWithCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

// ============================================
// Project Actions
// ============================================

export async function createProject(data: {
  name: string;
  description?: string;
  colorId: string;
  status?: string;
  priority?: string;
  lead?: string;
  startDate?: string;
  targetDate?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await projectService.createProject(
    {
      name: data.name,
      description: data.description,
      colorId: data.colorId,
      status: data.status,
      priority: data.priority,
      lead: data.lead,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
    },
    session.user.id
  );

  revalidatePath("/", "layout");
  return project;
}

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string;
    colorId?: string;
    status?: string;
    priority?: string;
    lead?: string;
    startDate?: string | null;
    targetDate?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberCheck = await requireProjectAdmin(projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  const project = await projectService.updateProject(projectId, {
    name: data.name,
    description: data.description,
    colorId: data.colorId,
    status: data.status,
    priority: data.priority,
    lead: data.lead,
    startDate: data.startDate !== undefined ? (data.startDate ? new Date(data.startDate) : null) : undefined,
    targetDate: data.targetDate !== undefined ? (data.targetDate ? new Date(data.targetDate) : null) : undefined,
  });

  revalidatePath("/", "layout");
  return project;
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberCheck = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId: session.user.id } },
  });
  if (!memberCheck || memberCheck.role !== Role.OWNER) throw new Error("Forbidden");

  await projectService.deleteProject(projectId);
  revalidatePath("/", "layout");
}

// ============================================
// Task Actions
// ============================================

export async function createTask(data: {
  projectId: string;
  title: string;
  type?: string;
  status?: string;
  startDate?: string | null;
  dueDate?: string | null;
  description?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberCheck = await requireProjectMember(data.projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  const task = await taskService.createTask({
    projectId: data.projectId,
    title: data.title,
    type: (data.type as "design" | "dev" | "research" | "content" | "marketing" | "other") ?? "dev",
    status: (data.status as "idea" | "planned" | "in_progress" | "blocked" | "done" | "archived") ?? "idea",
    startDate: data.startDate ? new Date(data.startDate) : undefined,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    description: data.description,
  });

  revalidatePath("/", "layout");
  return task;
}

export async function updateTask(
  taskId: string,
  updates: {
    title?: string;
    type?: string;
    status?: string;
    startDate?: string | null;
    dueDate?: string | null;
    description?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Not found");

  const memberCheck = await requireProjectMember(task.projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  const updated = await taskService.updateTask(taskId, {
    title: updates.title,
    type: updates.type as "design" | "dev" | "research" | "content" | "marketing" | "other" | undefined,
    status: updates.status as "idea" | "planned" | "in_progress" | "blocked" | "done" | "archived" | undefined,
    startDate: updates.startDate !== undefined ? (updates.startDate ? new Date(updates.startDate) : null) : undefined,
    dueDate: updates.dueDate !== undefined ? (updates.dueDate ? new Date(updates.dueDate) : null) : undefined,
    description: updates.description !== undefined ? updates.description : undefined,
  });

  revalidatePath("/", "layout");
  return updated;
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Not found");

  const memberCheck = await requireProjectMember(task.projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  await taskService.deleteTask(taskId);
  revalidatePath("/", "layout");
}

// ============================================
// Note Actions
// ============================================

export async function createNote(data: {
  title: string;
  content?: string;
  projectId?: string | null;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const note = await noteService.createNote(
    { title: data.title, content: data.content ?? "", projectId: data.projectId },
    session.user.id
  );

  revalidatePath("/notes");
  revalidatePath("/", "layout");
  return note;
}

export async function updateNote(
  noteId: string,
  data: { title?: string; content?: string; projectId?: string | null }
) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== session.user.id) throw new Error("Forbidden");

  const updated = await noteService.updateNote(noteId, data);
  revalidatePath("/notes");
  revalidatePath("/", "layout");
  return updated;
}

export async function deleteNote(noteId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const note = await db.note.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== session.user.id) throw new Error("Forbidden");

  await noteService.deleteNote(noteId);
  revalidatePath("/notes");
  revalidatePath("/", "layout");
}

// ============================================
// Member Actions
// ============================================

export async function removeMember(memberId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await memberService.removeMember(memberId, session.user.id);

  if ("error" in result) {
    if (result.error === "NOT_FOUND") throw new Error("Member not found");
    if (result.error === "CANNOT_REMOVE_OWNER") throw new Error("Cannot remove project owner");
    if (result.error === "FORBIDDEN") throw new Error("Only admins can remove members");
  }

  revalidatePath("/", "layout");
}

// ============================================
// Invite Actions
// ============================================

export async function generateInvite(projectId: string, role: "ADMIN" | "MEMBER" | "VIEWER" = "MEMBER") {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const memberCheck = await requireProjectAdmin(projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  const result = await inviteService.createInvite({ projectId, role }, session.user.id);
  return result;
}

export async function acceptInvite(token: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await inviteService.acceptInvite(token, session.user.id);

  if ("error" in result) {
    if (result.error === "INVALID_INVITE") throw new Error("Invalid invite");
    if (result.error === "EXPIRED") throw new Error("Invite expired or already used");
  }

  revalidatePath("/", "layout");
  return result;
}

// ============================================
// Assignee Actions
// ============================================

export async function addAssignee(taskId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const memberCheck = await requireProjectMember(task.projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  const result = await assigneeService.addAssignee(taskId, userId, task.projectId);

  if ("error" in result) throw new Error("User is not a project member");

  revalidatePath("/", "layout");
  return result.data;
}

export async function removeAssignee(taskId: string, userId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const task = await db.task.findUnique({ where: { id: taskId } });
  if (!task) throw new Error("Task not found");

  const memberCheck = await requireProjectMember(task.projectId, session.user.id);
  if (!isMember(memberCheck)) throw new Error("Forbidden");

  await assigneeService.removeAssignee(taskId, userId);
  revalidatePath("/", "layout");
}
