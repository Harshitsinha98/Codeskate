import Link from "next/link";
import { FileText } from "lucide-react";
import { listBillingInvoiceRows } from "@/lib/billing-dashboard";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import {
  FinanceRealtimeRefresher,
  invoiceStatusPresentation,
  financeTitleCase,
} from "@/features/finance";
import { INVOICE_STATUS, type InvoiceStatusValue } from "@/constants/finance";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = Object.values(INVOICE_STATUS) as InvoiceStatusValue[];

export default async function BillingInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active = STATUS_FILTERS.includes(status as InvoiceStatusValue) ? status : undefined;
  const invoices = await listBillingInvoiceRows(active);

  const tabClass = (isActive: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-sm transition-colors",
      isActive ? "border-ink bg-ink text-surface" : "border-line text-ink-muted hover:text-ink"
    );

  return (
    <div className="space-y-8">
      <FinanceRealtimeRefresher />

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-display-lg text-ink">Invoices</h1>
          <p className="mt-2 text-ink-muted">All invoices across the agency.</p>
        </div>
        <Link href="/admin/billing" className="text-sm text-royal-700 hover:text-royal">
          ← Billing overview
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2">
        <Link href="/admin/billing/invoices" className={tabClass(!active)}>
          All
        </Link>
        {STATUS_FILTERS.map((s) => (
          <Link key={s} href={`/admin/billing/invoices?status=${s}`} className={tabClass(active === s)}>
            {financeTitleCase(s)}
          </Link>
        ))}
      </nav>

      <Panel title={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}>
        {invoices.length === 0 ? (
          <EmptyState icon={<FileText className="h-5 w-5" />} title="No invoices found" className="border-0 bg-transparent py-10" />
        ) : (
          <ul className="divide-y divide-line">
            {invoices.map((inv) => (
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
                  <span className="text-sm tabular-nums text-ink">
                    {formatMoney({ amountMinor: inv.totalMinor, currency: inv.currency })}
                  </span>
                  <StatusBadge presentation={invoiceStatusPresentation(inv.status)} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
