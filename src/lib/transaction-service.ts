/**
 * Transaction Service — the ONE place invoice money-movements are recorded.
 *
 * A Transaction is the history row for a payment, partial payment, refund, or
 * manual adjustment against an invoice (see @/constants/finance TRANSACTION_TYPE).
 * Provider-agnostic: `gateway`/`gatewayReference` carry the Razorpay (or a future
 * provider's) payment/refund id. No finance module writes `db.transaction.create`
 * directly — they funnel through `recordTransaction`, which also appends the
 * matching immutable Ledger entry so the journal and the history never diverge.
 *
 * Accepts a base Prisma client or a `$transaction` client so a caller can record
 * inside its own atomic block (e.g. the payment-capture transaction).
 *
 * Server-only.
 */

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { appendEntry } from "@/lib/ledger-service";
import {
  TRANSACTION_TYPE,
  TRANSACTION_STATUS,
  LEDGER_ENTRY_TYPE,
  LEDGER_REFERENCE_TYPE,
  type TransactionTypeValue,
  type TransactionStatusValue,
} from "@/constants/finance";
import type { Transaction } from "@/types/finance";

type Db = PrismaClient | Prisma.TransactionClient;

type TransactionRow = {
  id: string;
  invoiceId: string;
  type: string;
  status: string;
  amountMinor: number;
  currency: string;
  gateway: string | null;
  gatewayReference: string | null;
  notes: string | null;
  actorId: string | null;
  createdAt: Date;
};

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    type: row.type as TransactionTypeValue,
    status: row.status as TransactionStatusValue,
    amountMinor: row.amountMinor,
    currency: row.currency,
    gateway: row.gateway,
    gatewayReference: row.gatewayReference,
    notes: row.notes,
    actorId: row.actorId,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Ledger direction for each transaction type: payments credit, refunds debit. */
function ledgerTypeFor(type: TransactionTypeValue) {
  switch (type) {
    case TRANSACTION_TYPE.REFUND:
      return LEDGER_ENTRY_TYPE.DEBIT;
    case TRANSACTION_TYPE.PAYMENT:
    case TRANSACTION_TYPE.PARTIAL_PAYMENT:
    case TRANSACTION_TYPE.MANUAL_ADJUSTMENT:
    default:
      return LEDGER_ENTRY_TYPE.CREDIT;
  }
}

export interface RecordTransactionInput {
  invoiceId: string;
  type: TransactionTypeValue;
  amountMinor: number;
  currency?: string;
  status?: TransactionStatusValue;
  gateway?: string | null;
  gatewayReference?: string | null;
  notes?: string | null;
  actorId?: string | null;
}

/**
 * Record ONE transaction against an invoice AND append its matching ledger
 * entry. A successful movement always writes both (through the Ledger Service),
 * so the immutable journal reflects every recorded payment/refund/adjustment.
 * A non-success (pending/failed) transaction records the history row only — no
 * ledger movement, since nothing settled.
 */
export async function recordTransaction(
  input: RecordTransactionInput,
  db: Db = prisma
): Promise<Transaction> {
  const currency = input.currency ?? "INR";
  const status = input.status ?? TRANSACTION_STATUS.SUCCESS;

  const row = await db.transaction.create({
    data: {
      invoiceId: input.invoiceId,
      type: input.type,
      status,
      amountMinor: input.amountMinor,
      currency,
      gateway: input.gateway ?? null,
      gatewayReference: input.gatewayReference ?? null,
      notes: input.notes ?? null,
      actorId: input.actorId ?? null,
    },
  });
  const transaction = toTransaction(row);

  if (status === TRANSACTION_STATUS.SUCCESS) {
    await appendEntry(
      {
        type: ledgerTypeFor(input.type),
        amountMinor: input.amountMinor,
        currency,
        referenceType: LEDGER_REFERENCE_TYPE.TRANSACTION,
        referenceId: transaction.id,
        invoiceId: input.invoiceId,
        description: `${input.type.replace(/_/g, " ")} recorded${
          input.gatewayReference ? ` (${input.gatewayReference})` : ""
        }`,
        actorId: input.actorId ?? null,
      },
      db
    );
  }

  return transaction;
}

/** List an invoice's transactions (newest first). */
export async function listTransactionsForInvoice(
  invoiceId: string,
  db: Db = prisma
): Promise<Transaction[]> {
  const rows = await db.transaction.findMany({
    where: { invoiceId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toTransaction);
}

/** List the most recent transactions across all invoices (newest first). */
export async function listRecentTransactions(limit = 10, db: Db = prisma): Promise<Transaction[]> {
  const rows = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toTransaction);
}
