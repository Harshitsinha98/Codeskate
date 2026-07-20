/**
 * Finance & Billing constants — values only (the single source of truth the
 * `@/types/finance` unions derive from). Consumed by the finance services
 * (`@/lib/invoice-service`, `@/lib/ledger-service`, `@/lib/transaction-service`,
 * `@/lib/refund-service`) and the admin + client billing surfaces.
 *
 * Finance sits DOWNSTREAM of the existing engines: an Invoice is generated the
 * moment a checkout Order's payment is captured (see `@/lib/order-service`), its
 * lines mirror the SAME `@/lib/pricing-engine` breakdown the order was priced
 * with (no second pricing model), and every financial action appends an
 * immutable Ledger entry. Statuses/types are plain strings (no DB enum) so a
 * future value needs no migration — an unknown value renders via `titleCase`.
 */

/** Invoice lifecycle. `paid` is terminal-success; `refunded` follows a refund. */
export const INVOICE_STATUS = {
  DRAFT: "draft",
  PENDING: "pending",
  PAID: "paid",
  PARTIALLY_PAID: "partially_paid",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

export type InvoiceStatusValue = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

/** Statuses that count an invoice as settled (no balance due). */
export const INVOICE_SETTLED_STATUSES: ReadonlySet<InvoiceStatusValue> = new Set([
  INVOICE_STATUS.PAID,
  INVOICE_STATUS.REFUNDED,
  INVOICE_STATUS.CANCELLED,
]);

/** The kind of money movement a transaction records against an invoice. */
export const TRANSACTION_TYPE = {
  PAYMENT: "payment",
  /** Foundation — partial capture support (schema + service ready, UI later). */
  PARTIAL_PAYMENT: "partial_payment",
  REFUND: "refund",
  /** Foundation — manual admin adjustment (schema + service ready, UI later). */
  MANUAL_ADJUSTMENT: "manual_adjustment",
} as const;

export type TransactionTypeValue = (typeof TRANSACTION_TYPE)[keyof typeof TRANSACTION_TYPE];

/** Transaction settlement state (mirrors the payment lifecycle). */
export const TRANSACTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export type TransactionStatusValue =
  (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/**
 * Ledger direction. The ledger is an immutable, append-only journal: a CREDIT
 * increases recognised revenue (a captured payment), a DEBIT decreases it (a
 * refund / adjustment). Entries are NEVER edited — a correction is a new entry.
 */
export const LEDGER_ENTRY_TYPE = {
  CREDIT: "credit",
  DEBIT: "debit",
} as const;

export type LedgerEntryTypeValue = (typeof LEDGER_ENTRY_TYPE)[keyof typeof LEDGER_ENTRY_TYPE];

/** The domain a ledger entry references (for traceability + reporting). */
export const LEDGER_REFERENCE_TYPE = {
  INVOICE: "invoice",
  TRANSACTION: "transaction",
  REFUND: "refund",
  ORDER: "order",
} as const;

export type LedgerReferenceTypeValue =
  (typeof LEDGER_REFERENCE_TYPE)[keyof typeof LEDGER_REFERENCE_TYPE];

/** Refund scope. `partial` is foundation (schema + service ready, admin UI later). */
export const REFUND_TYPE = {
  FULL: "full",
  PARTIAL: "partial",
} as const;

export type RefundTypeValue = (typeof REFUND_TYPE)[keyof typeof REFUND_TYPE];

/** Human-facing prefix + random length of the generated public Invoice number. */
export const INVOICE_NUMBER_PREFIX = "INV";
export const INVOICE_NUMBER_RANDOM_LENGTH = 6;
