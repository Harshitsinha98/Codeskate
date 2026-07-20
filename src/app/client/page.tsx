import Link from "next/link";
import { FolderOpen, Receipt, Activity } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getClientOverview } from "@/lib/client-dashboard";
import { formatMoney } from "@/lib/money";
import { ProjectCard } from "@/features/client-dashboard/components/ProjectCard";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import {
  orderStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";

export default async function ClientDashboardPage() {
  // The layout guarantees a session; re-read it for the user id + greeting.
  const session = await getServerSession();
  const user = session!.user;

  const { activeProjects, recentOrders, recentActivity } = await getClientOverview(user.id);

  const firstName = (user.name ?? "").split(" ")[0] || "there";

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-display-lg text-ink">Welcome back, {firstName}</h1>
        <p className="mt-2 text-ink-muted">
          Track your active projects, orders, and delivery progress.
        </p>
      </header>

      {/* Active projects */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-ink">Active projects</h2>
          {activeProjects.length > 0 && (
            <span className="text-xs text-ink-faint">
              {activeProjects.length} active
            </span>
          )}
        </div>

        {activeProjects.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title="No active projects yet"
            description="Once your order is confirmed, your project appears here with live progress."
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent orders */}
        <Panel
          title="Recent orders"
          className="lg:col-span-3"
          bodyClassName="space-y-3"
          action={
            <Link href="/client/invoices" className="text-sm text-royal-700 hover:text-royal">
              View invoices →
            </Link>
          }
        >
          {recentOrders.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-7 w-7" />}
              title="No orders yet"
              description="Your purchases will show up here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <ul className="divide-y divide-line">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{order.serviceTitle}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {order.packageName ? `${order.packageName} · ` : ""}
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-ink-soft">
                      {formatMoney({ amountMinor: order.totalMinor, currency: order.currency })}
                    </span>
                    <StatusBadge presentation={orderStatusPresentation(order.status)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Recent activity */}
        <Panel title="Recent activity" className="lg:col-span-2">
          {recentActivity.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-7 w-7" />}
              title="Nothing yet"
              description="Project updates will appear here."
              className="border-0 bg-transparent py-10"
            />
          ) : (
            <TimelineFeed items={recentActivity} />
          )}
        </Panel>
      </div>
    </div>
  );
}
