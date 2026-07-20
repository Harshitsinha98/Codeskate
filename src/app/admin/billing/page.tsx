import Link from "next/link";
import { IndianRupee, Clock, RotateCcw, FileText, Receipt } from "lucide-react";
import { getBillingDashboard } from "@/lib/billing-dashboard";
import { MetricCard } from "@/features/admin-dashboard/components/MetricCard";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate, formatDateTime } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import {
  FinanceRealtimeRefresher,
  invoiceStatusPresentation,
  transactionTypePresentation,
} from "@/features/finance";

export const dynamic = "force-dynamic";

export default async function BillingDashboardPage() {
  const dash = await getBillingDashboard();
  const money = (amountMinor: number) => formatMoney({ amountMinor, currency: dash.currency });

  return (
    <div className="space-y-10">
      <FinanceRealtimeRefresher />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">Billing</h1>
          <p className="mt-2 text-ink-muted">Revenue, invoices, transactions, and refunds.</p>
        </div>
        <Link
          href="/admin/billing/invoices"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
        >
          View all invoices →
        </Link>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Recognised revenue" value={money(dash.revenueMinor)} icon={<IndianRupee className="h-4 w-4" />} />
        <MetricCard label="Pending payments" value={money(dash.pendingPaymentsMinor)} icon={<Clock className="h-4 w-4" />} />
        <MetricCard label="Refunds" value={money(dash.refundsMinor)} icon={<RotateCcw className="h-4 w-4" />} />
        <MetricCard label="Invoices" value={dash.invoiceCount} icon={<FileText className="h-4 w-4" />} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl border border-line bg-base/50 p-4">
          <p className="text-2xl font-semibold tabular-nums text-ink">{dash.paidInvoiceCount}</p>
          <p className="mt-1 text-xs text-ink-muted">Paid</p>
        </div>
        <div className="rounded-3xl border border-line bg-base/50 p-4">
          <p className="text-2xl font-semibold tabular-nums text-ink">{dash.pendingInvoiceCount}</p>
          <p className="mt-1 text-xs text-ink-muted">Pending / partial</p>
        </div>
        <div className="rounded-3xl border border-line bg-base/50 p-4">
          <p className="text-2xl font-semibold tabular-nums text-ink">{dash.refundedInvoiceCount}</p>
          <p className="mt-1 text-xs text-ink-muted">Refunded</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-5">
        <Panel
          title="Recent invoices"
          className="lg:col-span-3"
          action={
            <Link href="/admin/billing/invoices" className="text-sm text-royal-700 hover:text-royal">
              All invoices →
            </Link>
          }
        >
          {dash.recentInvoices.length === 0 ? (
            <EmptyState icon={<FileText className="h-5 w-5" />} title="No invoices yet" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {dash.recentInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/billing/invoices/${inv.id}`}
                      className="truncate text-sm font-medium text-ink hover:text-royal-700"
                    >
                      {inv.number}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {inv.clientName ?? "—"} · {formatDate(inv.invoiceDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-sm tabular-nums text-ink">{money(inv.totalMinor)}</span>
                    <StatusBadge presentation={invoiceStatusPresentation(inv.status)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Recent transactions" className="lg:col-span-2">
          {dash.recentTransactions.length === 0 ? (
            <EmptyState icon={<Receipt className="h-5 w-5" />} title="No transactions yet" className="border-0 bg-transparent py-10" />
          ) : (
            <ul className="divide-y divide-line">
              {dash.recentTransactions.map((txn) => (
                <li key={txn.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-ink">{txn.invoiceNumber}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">{formatDateTime(txn.createdAt)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-sm tabular-nums text-ink">{money(txn.amountMinor)}</span>
                    <StatusBadge presentation={transactionTypePresentation(txn.type)} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
