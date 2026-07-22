import { describe, it, expect } from "vitest";
import { appendEntry, currentBalanceMinor } from "@/lib/ledger-service";
import { LEDGER_ENTRY_TYPE, LEDGER_REFERENCE_TYPE } from "@/constants/finance";

/**
 * Minimal in-memory stand-in for the Prisma client covering exactly the surface
 * the ledger service touches: `$executeRaw` (the advisory lock — a no-op here),
 * `ledgerEntry.findFirst` (latest balance), and `ledgerEntry.create` (append).
 * This exercises the running-balance math and credit/debit direction without a
 * live database.
 */
function makeFakeDb() {
  const rows: Array<Record<string, unknown>> = [];
  let seq = 0;
  return {
    $executeRaw: async (..._args: unknown[]) => 0,
    ledgerEntry: {
      findFirst: async () => rows[rows.length - 1] ?? null,
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const row = { id: `ledger_${++seq}`, createdAt: new Date(), ...data };
        rows.push(row);
        return row;
      },
    },
  };
}

const input = (type: string, amountMinor: number) => ({
  type: type as typeof LEDGER_ENTRY_TYPE.CREDIT,
  amountMinor,
  currency: "INR",
  referenceType: LEDGER_REFERENCE_TYPE.TRANSACTION,
  referenceId: "txn_1",
  description: "test entry",
});

describe("ledger running balance", () => {
  it("starts at zero for an empty ledger", async () => {
    const db = makeFakeDb() as any;
    expect(await currentBalanceMinor(db)).toBe(0);
  });

  it("a credit increases the running balance", async () => {
    const db = makeFakeDb() as any;
    const e = await appendEntry(input(LEDGER_ENTRY_TYPE.CREDIT, 10_000_00), db);
    expect(e.balanceAfterMinor).toBe(10_000_00);
    expect(await currentBalanceMinor(db)).toBe(10_000_00);
  });

  it("a debit decreases the running balance", async () => {
    const db = makeFakeDb() as any;
    await appendEntry(input(LEDGER_ENTRY_TYPE.CREDIT, 10_000_00), db);
    const e = await appendEntry(input(LEDGER_ENTRY_TYPE.DEBIT, 3_000_00), db);
    expect(e.balanceAfterMinor).toBe(7_000_00);
  });

  it("stamps each entry with the balance AFTER it, in sequence", async () => {
    const db = makeFakeDb() as any;
    const a = await appendEntry(input(LEDGER_ENTRY_TYPE.CREDIT, 5_000_00), db);
    const b = await appendEntry(input(LEDGER_ENTRY_TYPE.CREDIT, 2_500_00), db);
    const c = await appendEntry(input(LEDGER_ENTRY_TYPE.DEBIT, 1_000_00), db);
    expect([a.balanceAfterMinor, b.balanceAfterMinor, c.balanceAfterMinor]).toEqual([
      5_000_00,
      7_500_00,
      6_500_00,
    ]);
  });

  it("defaults currency to INR when omitted", async () => {
    const db = makeFakeDb() as any;
    const e = await appendEntry(
      {
        type: LEDGER_ENTRY_TYPE.CREDIT,
        amountMinor: 100,
        referenceType: LEDGER_REFERENCE_TYPE.TRANSACTION,
        referenceId: "txn_1",
        description: "no currency",
      },
      db
    );
    expect(e.currency).toBe("INR");
  });
});
