import Link from "next/link";
import {
  ShoppingCart,
  FolderKanban,
  UserPlus,
  Loader,
  CheckCircle2,
} from "lucide-react";
import { getAdminOverview } from "@/lib/admin-dashboard";
import { formatMoney } from "@/lib/money";
import { MetricCard } from "@/features/admin-dashboard/components/MetricCard";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { TimelineFeed } from "@/features/client-dashboard/components/TimelineFeed";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { paymentStatusPresentation } from "@/features/admin-dashboard/lib/presentation";

export default async function AdminOverviewPage() {
  const { metrics, recentPayments, recentActivity } = await getAdminOverview();

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-display-lg text-ink">Admin overview</h1>
        <p className="mt-2 text-ink-muted">Agency-wide orders, delivery, and activity.</p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Total orders" value={metrics.totalOrders} icon={<ShoppingCart className="h-4 w-4" />} />
        <MetricCard label="Active projects" value={metrics.activeProjects} icon={<FolderKanban className="h-4 w-4" />} />
        <MetricCard label="Pending assignment" value={metrics.pendingAssignment} icon={<UserPlus className="h-4 w-4" />} />
        <MetricCard label="In progress" value={metrics.inProgress} icon={<Loader className="h-4 w-4" />} />
        <MetricCard label="Delivered" value={metrics.delivered} icon={<CheckCircle2 className="h-4 w-4" />} />
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel title="Recent payments" className="lg:col-span-3">
          {recentPayments.length === 0 ? (
            <EmptyState title="No payments yet" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {recentPayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {p.clientName ?? "Guest"}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {p.provider} · {formatDate(p.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-ink-soft">
                      {formatMoney({ amountMinor: p.amountMinor, currency: p.currency })}
                    </span>
                    <StatusBadge presentation={paymentStatusPresentation(p.status)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent client activity" className="lg:col-span-2">
          {recentActivity.length === 0 ? (
            <EmptyState title="Nothing yet" className="border-0 bg-transparent py-10" />
          ) : (
            <TimelineFeed items={recentActivity} />
          )}
        </Panel>
      </div>

      <div className="flex gap-3">
        <Link
          href="/admin/projects"
          className="text-sm font-medium text-royal-700 transition-colors hover:text-royal"
        >
          View all projects →
        </Link>
      </div>
    </div>
  );
}
