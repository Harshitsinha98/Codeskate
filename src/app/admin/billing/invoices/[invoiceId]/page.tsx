import Link from "next/link";
import { notFound } from "next/navigation";
import { Receipt, BookText } from "lucide-react";
import { getInvoice } from "@/lib/invoice-service";
import { listTransactionRowsForInvoice } from "@/lib/billing-dashboard";
import { listLedgerForInvoice } from "@/lib/ledger-service";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { EmptyState } from "@/features/client-dashboard/components/EmptyState";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate, formatDateTime } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import {
  FinanceRealtimeRefresher,
  RefundButton,
  invoiceStatusPresentation,
  transactionTypePresentation,
  ledgerTypePresentation,
} from "@/features/finance";
import { INVOICE_STATUS } from "@/constants/finance";

export const dynamic = "force-dynamic";

export default async function AdminInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const { invoiceId } = await params;
  const invoice = await getInvoice(invoiceId);
  if (!invoice) notFound();

  const [transactions, ledger] = await Promise.all([
    listTransactionRowsForInvoice(invoiceId),
    listLedgerForInvoice(invoiceId),
  ]);

  const money = (amountMinor: number) => formatMoney({ amountMinor, currency: invoice.currency });
  const netRefundable = invoice.amountPaidMinor - invoice.amountRefundedMinor;
  const canRefund = netRefundable > 0 && invoice.status !== INVOICE_STATUS.CANCELLED;

  return (
    <div className="space-y-8">
      <FinanceRealtimeRefresher />

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/billing/invoices" className="text-sm text-royal-700 hover:text-royal">
            ← All invoices
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-display-lg text-ink">{invoice.number}</h1>
            <StatusBadge presentation={invoiceStatusPresentation(invoice.status)} />
          </div>
          <p className="mt-2 text-ink-muted">
            Issued {formatDate(invoice.invoiceDate)}
            {invoice.dueDate ? ` · Due ${formatDate(invoice.dueDate)}` : ""}
          </p>
        </div>
        {canRefund && <RefundButton invoiceId={invoice.id} />}
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Bill to" className="lg:col-span-1">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-xs text-ink-faint">Name</dt>
              <dd className="text-ink">{invoice.billing.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Email</dt>
              <dd className="text-ink">{invoice.billing.email || "—"}</dd>
            </div>
            {invoice.billing.company && (
              <div>
                <dt className="text-xs text-ink-faint">Company</dt>
                <dd className="text-ink">{invoice.billing.company}</dd>
              </div>
            )}
            {invoice.gstNumber && (
              <div>
                <dt className="text-xs text-ink-faint">GST</dt>
                <dd className="text-ink">{invoice.gstNumber}</dd>
              </div>
            )}
            {(invoice.billing.city || invoice.billing.state || invoice.billing.country) && (
              <div>
                <dt className="text-xs text-ink-faint">Location</dt>
                <dd className="text-ink">
                  {[invoice.billing.city, invoice.billing.state, invoice.billing.country].filter(Boolean).join(", ")}
                </dd>
              </div>
            )}
          </dl>
        </Panel>

        <Panel title="Line items" className="lg:col-span-2">
          <ul className="divide-y divide-line">
            {invoice.lineItems.map((line, i) => (
              <li key={`${line.kind}-${line.refId}-${i}`} className="flex items-center justify-between gap-4 py-2.5 first:pt-0">
                <span className="text-sm text-ink">{line.label}</span>
                <span className="text-sm tabular-nums text-ink">{money(line.amountMinor)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="tabular-nums text-ink">{money(invoice.subtotalMinor)}</dd>
            </div>
            {invoice.discountMinor > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Discount</dt>
                <dd className="tabular-nums text-ink">−{money(invoice.discountMinor)}</dd>
              </div>
            )}
            {invoice.taxMinor > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-muted">Tax</dt>
                <dd className="tabular-nums text-ink">{money(invoice.taxMinor)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
              <dt className="text-ink">Total</dt>
              <dd className="tabular-nums text-ink">{money(invoice.totalMinor)}</dd>
            </div>
            {invoice.amountRefundedMinor > 0 && (
              <div className="flex justify-between text-violet-700">
                <dt>Refunded</dt>
                <dd className="tabular-nums">−{money(invoice.amountRefundedMinor)}</dd>
              </div>
            )}
          </dl>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Transactions">
          {transactions.length === 0 ? (
            <EmptyState icon={<Receipt className="h-5 w-5" />} title="No transactions" className="border-0 bg-transparent py-8" />
          ) : (
            <ul className="divide-y divide-line">
              {transactions.map((txn) => (
                <li key={txn.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge presentation={transactionTypePresentation(txn.type)} />
                      {txn.gateway && <span className="text-xs text-ink-faint">{txn.gateway}</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-ink-muted">{formatDateTime(txn.createdAt)}</p>
                  </div>
                  <span className="shrink-0 text-sm tabular-nums text-ink">{money(txn.amountMinor)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Ledger">
          {ledger.length === 0 ? (
            <EmptyState icon={<BookText className="h-5 w-5" />} title="No ledger entries" className="border-0 bg-transparent py-8" />
          ) : (
            <ul className="divide-y divide-line">
              {ledger.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusBadge presentation={ledgerTypePresentation(entry.type)} />
                      <span className="truncate text-xs text-ink-muted">{entry.description}</span>
                    </div>
                    <p className="mt-1 text-xs text-ink-faint">{formatDateTime(entry.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm tabular-nums text-ink">{money(entry.amountMinor)}</p>
                    <p className="text-xs tabular-nums text-ink-faint">bal {money(entry.balanceAfterMinor)}</p>
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
