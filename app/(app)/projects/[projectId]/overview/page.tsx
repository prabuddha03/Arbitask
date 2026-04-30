import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectOverviewClient } from "@/components/views/ProjectOverviewClient";

export default async function OverviewPage({ params }: { params: Promise<{ projectId: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      members: { include: { user: { select: { id: true, name: true, image: true } } } },
      tasks: { select: { id: true, status: true } },
    },
  });

  if (!project) notFound();

  const isMember = project.members.some((m) => m.userId === session.user!.id);
  if (!isMember) redirect("/dashboard");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ProjectOverviewClient project={project as any} />;
}
