import Link from "next/link";
import { getAdminOrders, ADMIN_ORDER_TABS } from "@/lib/admin-dashboard";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import {
  orderStatusPresentation,
  formatDate,
} from "@/features/client-dashboard/lib/presentation";

const DEFAULT_TAB = ADMIN_ORDER_TABS[0].key;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = ADMIN_ORDER_TABS.some((t) => t.key === status) ? status! : DEFAULT_TAB;
  const orders = await getAdminOrders(active);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-lg text-ink">Orders</h1>
        <p className="mt-2 text-ink-muted">Payments and fulfillment by status.</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {ADMIN_ORDER_TABS.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/orders?status=${tab.key}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm transition-colors",
              tab.key === active
                ? "border-ink bg-ink text-surface"
                : "border-line bg-surface text-ink-muted hover:text-ink"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <EmptyState title="No orders" description={`No ${active} orders to show.`} />
      ) : (
        <div className="overflow-hidden rounded-4xl border border-line bg-surface shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-faint">
                  <th className="px-5 py-4 font-medium">Order ID</th>
                  <th className="px-5 py-4 font-medium">Client</th>
                  <th className="px-5 py-4 font-medium">Service</th>
                  <th className="px-5 py-4 font-medium">Package</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-base/60">
                    <td className="px-5 py-4">
                      {o.projectId ? (
                        <Link
                          href={`/admin/projects/${o.projectId}`}
                          className="font-mono text-xs text-royal-700 hover:text-royal"
                        >
                          {o.id}
                        </Link>
                      ) : (
                        <span className="font-mono text-xs text-ink-muted">{o.id}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-ink-soft">{o.clientName ?? "Guest"}</td>
                    <td className="px-5 py-4 text-ink-soft">{o.serviceTitle}</td>
                    <td className="px-5 py-4 text-ink-muted">{o.packageName ?? "—"}</td>
                    <td className="px-5 py-4">
                      <StatusBadge presentation={orderStatusPresentation(o.status)} />
                    </td>
                    <td className="px-5 py-4 tabular-nums text-ink-soft">
                      {formatMoney({ amountMinor: o.totalMinor, currency: o.currency })}
                    </td>
                    <td className="px-5 py-4 text-ink-muted">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
