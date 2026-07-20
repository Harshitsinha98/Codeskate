/**
 * Billing dashboard read layer — server-only, agency-wide finance queries.
 *
 * Reads across ALL invoices/transactions/ledger (the admin finance surface),
 * mirroring `@/lib/admin-dashboard`. Recognised revenue comes from the immutable
 * ledger (the financial source of truth — the running balance of credits net of
 * debits), never recomputed from scratch here. Human client/service names come
 * from the DB + catalog. Access is gated by the caller (`@/lib/finance-auth`).
 */

import { prisma } from "@/lib/prisma";
import { listRecentTransactions, toTransaction } from "@/lib/transaction-service";
import { currentBalanceMinor } from "@/lib/ledger-service";
import { INVOICE_STATUS, TRANSACTION_TYPE, type InvoiceStatusValue } from "@/constants/finance";
import type {
  BillingDashboard,
  BillingInvoiceRow,
  BillingTransactionRow,
} from "@/types/finance";

/** Aggregate the finance dashboard tiles + recent invoices/transactions. */
export async function getBillingDashboard(): Promise<BillingDashboard> {
  const [
    invoiceCount,
    paidInvoiceCount,
    pendingInvoiceCount,
    refundedInvoiceCount,
    pendingAgg,
    refundAgg,
    revenueMinor,
    recentInvoiceRows,
    recentTxns,
  ] = await Promise.all([
    prisma.invoice.count(),
    prisma.invoice.count({ where: { status: INVOICE_STATUS.PAID } }),
    prisma.invoice.count({
      where: { status: { in: [INVOICE_STATUS.PENDING, INVOICE_STATUS.PARTIALLY_PAID, INVOICE_STATUS.DRAFT] } },
    }),
    prisma.invoice.count({ where: { status: INVOICE_STATUS.REFUNDED } }),
    // Pending amount = total still owed on non-settled invoices.
    prisma.invoice.aggregate({
      _sum: { totalMinor: true, amountPaidMinor: true },
      where: { status: { in: [INVOICE_STATUS.PENDING, INVOICE_STATUS.PARTIALLY_PAID] } },
    }),
    prisma.transaction.aggregate({
      _sum: { amountMinor: true },
      where: { type: TRANSACTION_TYPE.REFUND, status: "success" },
    }),
    currentBalanceMinor(),
    prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { client: { select: { name: true } } },
    }),
    listRecentTransactions(8),
  ]);

  const pendingPaymentsMinor =
    (pendingAgg._sum.totalMinor ?? 0) - (pendingAgg._sum.amountPaidMinor ?? 0);
  const refundsMinor = refundAgg._sum.amountMinor ?? 0;

  const recentInvoices: BillingInvoiceRow[] = recentInvoiceRows.map((inv) => ({
    id: inv.id,
    number: inv.number,
    clientName: inv.client?.name ?? null,
    status: inv.status as InvoiceStatusValue,
    totalMinor: inv.totalMinor,
    currency: inv.currency,
    invoiceDate: inv.invoiceDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() ?? null,
  }));

  // Join the recent transactions to their invoice number + client name.
  const invoiceIds = Array.from(new Set(recentTxns.map((t) => t.invoiceId)));
  const invoices = invoiceIds.length
    ? await prisma.invoice.findMany({
        where: { id: { in: invoiceIds } },
        select: { id: true, number: true, client: { select: { name: true } } },
      })
    : [];
  const byId = new Map(invoices.map((i) => [i.id, i] as const));

  const recentTransactions: BillingTransactionRow[] = recentTxns.map((t) => {
    const inv = byId.get(t.invoiceId);
    return {
      ...t,
      invoiceNumber: inv?.number ?? "—",
      clientName: inv?.client?.name ?? null,
    };
  });

  return {
    revenueMinor,
    pendingPaymentsMinor: Math.max(0, pendingPaymentsMinor),
    refundsMinor,
    currency: "INR",
    invoiceCount,
    paidInvoiceCount,
    pendingInvoiceCount,
    refundedInvoiceCount,
    recentInvoices,
    recentTransactions,
  };
}

/** List invoices as dashboard rows (newest first), optionally filtered by status. */
export async function listBillingInvoiceRows(status?: string): Promise<BillingInvoiceRow[]> {
  const rows = await prisma.invoice.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { client: { select: { name: true } } },
  });
  return rows.map((inv) => ({
    id: inv.id,
    number: inv.number,
    clientName: inv.client?.name ?? null,
    status: inv.status as InvoiceStatusValue,
    totalMinor: inv.totalMinor,
    currency: inv.currency,
    invoiceDate: inv.invoiceDate.toISOString(),
    dueDate: inv.dueDate?.toISOString() ?? null,
  }));
}

/** A joined transaction row (with invoice/client labels) for the invoice detail. */
export async function listTransactionRowsForInvoice(
  invoiceId: string
): Promise<BillingTransactionRow[]> {
  const [invoice, txns] = await Promise.all([
    prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { number: true, client: { select: { name: true } } },
    }),
    prisma.transaction.findMany({ where: { invoiceId }, orderBy: { createdAt: "desc" } }),
  ]);
  return txns.map((row) => ({
    ...toTransaction(row),
    invoiceNumber: invoice?.number ?? "—",
    clientName: invoice?.client?.name ?? null,
  }));
}
