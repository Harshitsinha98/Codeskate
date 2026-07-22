import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getEmployeeUser } from "@/lib/employee-auth";
import { unreadNotificationCount } from "@/lib/notifications";
import { Logo } from "@/components/ui/Logo";
import { RealtimeRefresher } from "@/features/realtime/components/RealtimeRefresher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

export const metadata = {
  title: "Workspace — AgencyOS",
  robots: { index: false, follow: false },
};

/**
 * Employee workspace shell + authorization gate. The proxy guards the
 * `/employee` prefix at the edge (authenticated?); here we enforce "employee
 * only" via the EMPLOYEE_EMAILS allowlist (`@/lib/employee-auth`).
 * Unauthenticated → /login; authenticated but not an employee → home (no leak
 * of the workspace's existence).
 *
 * The RealtimeRefresher is the SAME component the client and admin dashboards
 * mount — the SSE endpoint scopes events to the employee's assigned projects,
 * so the realtime layer is reused verbatim for this surface.
 */
export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login?redirect=/employee");

  const employee = await getEmployeeUser();
  if (!employee) redirect("/");

  const unread = await unreadNotificationCount(employee.id);

  return (
    <div className="min-h-screen bg-base">
      <RealtimeRefresher />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/employee" aria-label="Workspace home">
              <Logo />
            </Link>
            <span className="hidden items-center gap-1.5 text-sm text-ink-muted sm:inline-flex">
              <Briefcase className="h-4 w-4" />
              Workspace
            </span>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell initialUnread={unread} />
            <span className="max-w-[12rem] truncate text-sm text-ink-muted">
              {employee.name ?? employee.email}
            </span>
          </div>
        </div>
      </header>

      <main className="container-x py-10">{children}</main>
    </div>
  );
}
