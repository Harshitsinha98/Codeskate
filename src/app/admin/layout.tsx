import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/rbac/session";
import { getAdminUser } from "@/lib/admin-auth";
import { unreadNotificationCount } from "@/lib/notifications";
import { Logo } from "@/components/ui/Logo";
import { RealtimeRefresher } from "@/features/realtime/components/RealtimeRefresher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";

export const metadata = {
  title: "Admin — AgencyOS",
};

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/crm", label: "CRM" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/ai", label: "AI" },
];

/**
 * Admin shell + authorization gate. The proxy guards the `/admin` prefix at the
 * edge (authenticated?); here we enforce "admin only" via the ADMIN_EMAILS
 * allowlist (`@/lib/admin-auth`). Unauthenticated → /login; authenticated but
 * not an admin → home (no leak of the admin surface's existence).
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login?redirect=/admin");

  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const unread = await unreadNotificationCount(admin.id);

  return (
    <div className="min-h-screen bg-base">
      <RealtimeRefresher />
      <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
        <div className="container-x flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" aria-label="Admin home">
              <Logo />
            </Link>
            <nav className="hidden items-center gap-1 sm:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3 py-1.5 text-sm text-ink-muted transition-colors hover:bg-ink/5 hover:text-ink"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell initialUnread={unread} />
            <span className="max-w-[12rem] truncate text-sm text-ink-muted">
              {admin.name ?? admin.email}
            </span>
          </div>
        </div>
      </header>

      <main className="container-x py-10">{children}</main>
    </div>
  );
}
