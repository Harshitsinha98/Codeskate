import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Download } from "lucide-react";
import { getServerSession } from "@/lib/rbac/session";
import { getClientInvoice } from "@/lib/invoice-service";
import { isInvoicePdfAvailable } from "@/lib/invoice-pdf";
import { Panel } from "@/features/client-dashboard/components/Panel";
import { StatusBadge } from "@/features/client-dashboard/components/StatusBadge";
import { formatDate } from "@/features/client-dashboard/lib/presentation";
import { formatMoney } from "@/lib/money";
import { invoiceStatusPresentation } from "@/features/finance";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientInvoiceDetailPage({
  params,
}: {
  params: Promise<{ invoiceId: string }>;
}) {
  const session = await getServerSession();
  if (!session?.user) redirect("/login?redirect=/client/invoices");

  const { invoiceId } = await params;
  // Client-scoped read — only ever returns the caller's OWN invoice.
  const invoice = await getClientInvoice(session.user.id, invoiceId);
  if (!invoice) notFound();

  const pdfAvailable = isInvoicePdfAvailable();
  const money = (amountMinor: number) => formatMoney({ amountMinor, currency: invoice.currency });

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/client/invoices" className="text-sm text-royal-700 hover:text-royal">
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
        <button
          type="button"
          disabled={!pdfAvailable}
          title={pdfAvailable ? "Download PDF" : "PDF download coming soon"}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
            pdfAvailable
              ? "border-line text-ink hover:border-ink/40"
              : "cursor-not-allowed border-line text-ink-faint"
          )}
        >
          <Download className="h-4 w-4" />
          {pdfAvailable ? "Download PDF" : "PDF coming soon"}
        </button>
      </header>

      <Panel title="Bill to">
        <dl className="grid gap-3 sm:grid-cols-2 text-sm">
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
        </dl>
      </Panel>

      <Panel title="Summary">
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

      {invoice.notes && (
        <Panel title="Notes">
          <p className="text-sm text-ink-muted">{invoice.notes}</p>
        </Panel>
      )}
    </div>
  );
}
