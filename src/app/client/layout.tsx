import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { unreadNotificationCount } from "@/lib/notifications";
import { Logo } from "@/components/ui/Logo";
import { RealtimeRefresher } from "@/features/realtime/components/RealtimeRefresher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

export const metadata = {
  title: "Client Dashboard",
  robots: { index: false, follow: false },
};

/**
 * Client dashboard shell. Server-side auth gate: the proxy already blocks the
 * `/client` prefix at the edge on a missing cookie, but we re-validate the full
 * session here so a component can trust `session.user`. Unauthenticated →
 * /login?redirect=/client. Role gating (client_owner/collaborator) is deferred
 * until the organization/role backend lands (see @/lib/rbac).
 */
export default async function ClientLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login?redirect=/client");

  const unread = await unreadNotificationCount(session.user.id);

  return (
    <div className="min-h-screen bg-base">
      <RealtimeRefresher />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/client" aria-label="Client dashboard home">
              <Logo />
            </Link>
            <span className="hidden items-center gap-1.5 text-sm text-ink-muted sm:inline-flex">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell initialUnread={unread} />
            <span className="max-w-[12rem] truncate text-sm text-ink-muted">
              {session.user.name ?? session.user.email}
            </span>
          </div>
        </div>
      </header>

      <main className="container-x py-10">{children}</main>
    </div>
  );
}
