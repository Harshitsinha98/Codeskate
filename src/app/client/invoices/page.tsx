import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { listClientInvoices } from "@/lib/invoice-service";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import { invoiceStatusPresentation } from "@/features/finance";

export const dynamic = "force-dynamic";

export default async function ClientInvoicesPage() {
  const session = await getServerSession();
  if (!session?.user) redirect("/login?redirect=/client/invoices");

  const invoices = await listClientInvoices(session.user.id);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-display-lg text-ink">Invoices</h1>
        <p className="mt-2 text-ink-muted">View and download invoices for your payments.</p>
      </header>

      <Panel title={`${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}>
        {invoices.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title="No invoices yet"
            description="Once a payment is confirmed, your invoice will appear here."
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <ul className="divide-y divide-line">
            {invoices.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link
                    href={`/client/invoices/${inv.id}`}
                    className="truncate text-sm font-medium text-ink hover:text-royal-700"
                  >
                    {inv.number}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-ink-muted">{formatDate(inv.invoiceDate)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm tabular-nums text-ink-soft">
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
