import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth, signIn } from "@/lib/auth";
import { Btn } from "@/components/ui";
import { PROJECT_COLORS } from "@/lib/constants";
import { InviteStatus } from "@/lib/constants";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const session = await auth();

  const invite = await db.invite.findUnique({
    where: { token },
    include: {
      project: { select: { id: true, name: true, colorId: true } },
      sender: { select: { name: true } },
    },
  });

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'Manrope', sans-serif" }}>
        <div style={{ textAlign: "center", padding: 48, borderRadius: 20, background: "var(--surface)", border: "1px solid var(--border)", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: "var(--text)" }}>
            {!invite ? "Invalid invite link" : invite.status === "ACCEPTED" ? "Invite already used" : "Invite expired"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text3)" }}>
            {!invite ? "This invite link is invalid or has been revoked." : invite.status === "ACCEPTED" ? "This invite has already been accepted." : "This invite link has expired. Ask the project owner to generate a new one."}
          </p>
        </div>
      </div>
    );
  }

  const pc = PROJECT_COLORS.find((c) => c.id === invite.project.colorId) || PROJECT_COLORS[0];

  // If user is logged in, check if already a member
  if (session?.user?.id) {
    const existing = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: invite.project.id, userId: session.user.id } },
    });
    if (existing) {
      redirect(`/projects/${invite.project.id}/kanban`);
    }
  }

  async function acceptInvite() {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user?.id) {
      await signIn("google", { redirectTo: `/invite/${token}` });
      return;
    }

    const userId = currentSession.user.id;
    const inv = await db.invite.findUnique({ where: { token } });
    if (!inv || inv.status !== InviteStatus.PENDING || inv.expiresAt < new Date()) return;

    const existing = await db.projectMember.findUnique({
      where: { projectId_userId: { projectId: inv.projectId, userId } },
    });
    if (!existing) {
      await db.projectMember.create({
        data: { projectId: inv.projectId, userId, role: inv.role },
      });
    }
    await db.invite.update({ where: { token }, data: { status: InviteStatus.ACCEPTED } });
    redirect(`/projects/${inv.projectId}/kanban`);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ textAlign: "center", padding: "48px 56px", borderRadius: 20, background: "var(--surface)", border: `1px solid ${pc.hex}44`, boxShadow: `0 0 40px ${pc.hex}22`, maxWidth: 440 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg, ${pc.hex}CC, ${pc.hex}66)`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28 }}>
          📂
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8, color: "var(--text)" }}>
          You&apos;re invited!
        </h1>
        <p style={{ fontSize: 15, color: "var(--text2)", marginBottom: 6 }}>
          <strong style={{ color: pc.hex }}>{invite.sender.name}</strong> invited you to join
        </p>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>
          {invite.project.name}
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 28 }}>
          Role: {invite.role.toLowerCase()} · Expires {invite.expiresAt.toLocaleDateString()}
        </p>
        {!session?.user ? (
          <div>
            <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 16 }}>
              Sign in with Google to accept this invite
            </p>
            <form action={acceptInvite}>
              <Btn fullWidth>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
                  <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Sign in with Google to Accept
              </Btn>
            </form>
          </div>
        ) : (
          <form action={acceptInvite}>
            <Btn fullWidth>
              Accept Invitation
            </Btn>
          </form>
        )}
      </div>
    </div>
  );
}
