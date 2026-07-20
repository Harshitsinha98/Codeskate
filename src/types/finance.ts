/**
 * Finance & Billing domain types — interfaces only.
 *
 * Mirrors the CRM/checkout convention: status VALUES come from
 * `@/constants/finance` (the single source of truth); these are the shapes the
 * finance services return and the billing surfaces render. Money is stored in
 * integer minor units per the `Money` convention (`@/types/common`).
 */

import type {
  InvoiceStatusValue,
  TransactionTypeValue,
  TransactionStatusValue,
  LedgerEntryTypeValue,
  LedgerReferenceTypeValue,
} from "@/constants/finance";

/**
 * A rendered snapshot line of an invoice. Sourced from the SAME pricing engine
 * breakdown the order was priced with — `kind` records where the line came from
 * (service package / add-on / discount coupon / tax), never a second pricing.
 */
export interface InvoiceLineItem {
  kind: "package" | "addon" | "discount" | "tax";
  refId: string;
  label: string;
  /** Signed minor units: positive for charges, negative for a discount line. */
  amountMinor: number;
}

/** Billing party details captured on the invoice (from the order's billing). */
export interface InvoiceBillingAddress {
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  gstNumber: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string | null;
  orderId: string | null;
  projectId: string | null;
  proposalId: string | null;

  billing: InvoiceBillingAddress;
  /** Denormalised GST number for quick display/filtering (also in `billing`). */
  gstNumber: string | null;

  lineItems: InvoiceLineItem[];
  notes: string | null;

  currency: string;
  subtotalMinor: number;
  discountMinor: number;
  taxMinor: number;
  totalMinor: number;
  /** Amount captured so far (partial-payment foundation). */
  amountPaidMinor: number;
  /** Amount refunded so far (partial-refund foundation). */
  amountRefundedMinor: number;

  status: InvoiceStatusValue;

  invoiceDate: string;
  dueDate: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  invoiceId: string;
  type: TransactionTypeValue;
  status: TransactionStatusValue;

  amountMinor: number;
  currency: string;

  gateway: string | null;
  gatewayReference: string | null;

  notes: string | null;
  actorId: string | null;
  createdAt: string;
}

/**
 * One immutable, append-only ledger entry. `balanceAfterMinor` is the running
 * balance foundation — the recognised-revenue balance immediately AFTER this
 * entry was appended. Entries are never edited.
 */
export interface LedgerEntry {
  id: string;
  type: LedgerEntryTypeValue;
  amountMinor: number;
  currency: string;
  balanceAfterMinor: number;

  referenceType: LedgerReferenceTypeValue;
  referenceId: string;

  invoiceId: string | null;
  description: string;
  actorId: string | null;
  createdAt: string;
}

/* ── Billing dashboard view models ─────────────────────────────────────────── */

/** A recent-transactions row for the billing dashboard, joined to its invoice. */
export interface BillingTransactionRow extends Transaction {
  invoiceNumber: string;
  clientName: string | null;
}

/** A recent-invoices row for the billing dashboard/list. */
export interface BillingInvoiceRow {
  id: string;
  number: string;
  clientName: string | null;
  status: InvoiceStatusValue;
  totalMinor: number;
  currency: string;
  invoiceDate: string;
  dueDate: string | null;
}

export interface BillingDashboard {
  /** Recognised revenue = sum of captured payments (ledger credits net of debits). */
  revenueMinor: number;
  pendingPaymentsMinor: number;
  refundsMinor: number;
  currency: string;

  invoiceCount: number;
  paidInvoiceCount: number;
  pendingInvoiceCount: number;
  refundedInvoiceCount: number;

  recentInvoices: BillingInvoiceRow[];
  recentTransactions: BillingTransactionRow[];
}
