import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { calcStats } from "@/lib/gamification";
import { AppShell } from "@/components/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;

  // Fetch projects where user is a member, plus their tasks
  const memberships = await db.projectMember.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          tasks: {
            select: {
              id: true,
              status: true,
              assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
            },
          },
          members: { include: { user: { select: { id: true, name: true, image: true } } } },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects = memberships.map((m) => m.project) as any[];

  const noteCount = await db.note.count({ where: { authorId: userId } });
  const stats = calcStats(
    projects.map((p) => ({ tasks: p.tasks })),
    noteCount
  );

  return (
    <AppShell
      projects={projects}
      stats={stats}
      user={{ id: userId, name: session.user.name ?? null, image: session.user.image ?? null }}
    >
      {children}
    </AppShell>
  );
}
