/**
 * Ledger Service — the ONE place the immutable financial journal is written.
 *
 * The ledger is append-only: every financial action (a captured payment, a
 * refund, a manual adjustment) appends EXACTLY ONE entry via `appendEntry`, and
 * rows are NEVER updated or deleted — a correction is a new entry. A CREDIT
 * increases recognised revenue, a DEBIT decreases it. Each entry stamps the
 * running `balanceAfterMinor` (balance foundation) computed from the prior
 * entry, so the journal is self-describing without a separate balance table.
 *
 * No finance module writes `db.ledgerEntry.create(...)` directly — they funnel
 * through here, mirroring how project activity funnels through the Timeline
 * Service. Accepts a base Prisma client or a `$transaction` client so a caller
 * can append inside its own atomic block (e.g. the payment-capture transaction).
 *
 * Server-only.
 */

import { Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  LEDGER_ENTRY_TYPE,
  type LedgerEntryTypeValue,
  type LedgerReferenceTypeValue,
} from "@/constants/finance";
import type { LedgerEntry } from "@/types/finance";

type Db = PrismaClient | Prisma.TransactionClient;

type LedgerRow = {
  id: string;
  type: string;
  amountMinor: number;
  currency: string;
  balanceAfterMinor: number;
  referenceType: string;
  referenceId: string;
  invoiceId: string | null;
  description: string;
  actorId: string | null;
  createdAt: Date;
};

function toLedgerEntry(row: LedgerRow): LedgerEntry {
  return {
    id: row.id,
    type: row.type as LedgerEntryTypeValue,
    amountMinor: row.amountMinor,
    currency: row.currency,
    balanceAfterMinor: row.balanceAfterMinor,
    referenceType: row.referenceType as LedgerReferenceTypeValue,
    referenceId: row.referenceId,
    invoiceId: row.invoiceId,
    description: row.description,
    actorId: row.actorId,
    createdAt: row.createdAt.toISOString(),
  };
}

export interface AppendLedgerInput {
  type: LedgerEntryTypeValue;
  amountMinor: number;
  currency?: string;
  referenceType: LedgerReferenceTypeValue;
  referenceId: string;
  invoiceId?: string | null;
  description: string;
  actorId?: string | null;
}

/**
 * Read the current recognised-revenue balance — the `balanceAfterMinor` of the
 * most recent entry, or 0 when the ledger is empty. The running balance is the
 * signed sum of all entries (credits add, debits subtract).
 */
export async function currentBalanceMinor(db: Db = prisma): Promise<number> {
  const last = await db.ledgerEntry.findFirst({
    orderBy: { createdAt: "desc" },
    select: { balanceAfterMinor: true },
  });
  return last?.balanceAfterMinor ?? 0;
}

/**
 * Append ONE immutable entry to the ledger, stamping the running balance. The
 * balance moves +amount on a credit, −amount on a debit. Never edits history.
 *
 * A transaction-scoped advisory lock serializes the read-balance → write-entry
 * sequence: without it, two concurrent appends (e.g. a webhook racing the
 * browser callback, or parallel refunds) could read the same prior balance and
 * write a corrupted running total. Callers MUST pass a transaction client (both
 * finance callers already wrap this in `prisma.$transaction`) so the lock is
 * held until the append commits.
 */
export async function appendEntry(input: AppendLedgerInput, db: Db = prisma): Promise<LedgerEntry> {
  const currency = input.currency ?? "INR";
  // Serialize all ledger appends within the caller's transaction. The lock is
  // released automatically when the transaction commits or rolls back.
  await db.$executeRaw`SELECT pg_advisory_xact_lock(4815162342)`;
  const previous = await currentBalanceMinor(db);
  const delta = input.type === LEDGER_ENTRY_TYPE.CREDIT ? input.amountMinor : -input.amountMinor;
  const balanceAfterMinor = previous + delta;

  const row = await db.ledgerEntry.create({
    data: {
      type: input.type,
      amountMinor: input.amountMinor,
      currency,
      balanceAfterMinor,
      referenceType: input.referenceType,
      referenceId: input.referenceId,
      invoiceId: input.invoiceId ?? null,
      description: input.description,
      actorId: input.actorId ?? null,
    },
  });
  return toLedgerEntry(row);
}

/** List a single invoice's ledger entries (chronological). */
export async function listLedgerForInvoice(invoiceId: string, db: Db = prisma): Promise<LedgerEntry[]> {
  const rows = await db.ledgerEntry.findMany({
    where: { invoiceId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(toLedgerEntry);
}

/** List the most recent ledger entries across all invoices (newest first). */
export async function listRecentLedger(limit = 20, db: Db = prisma): Promise<LedgerEntry[]> {
  const rows = await db.ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toLedgerEntry);
}
