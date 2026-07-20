/**
 * Invoice types. Placeholder foundation — interfaces only.
 * Aligned with docs/DATABASE.md (invoices, invoice_items).
 */

import type { BaseEntity, ID, ISODateString, Money } from "@/types/common";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partial"
  | "paid"
  | "overdue"
  | "void";

export type InvoiceType = "deposit" | "milestone" | "one_off" | "recurring";

export interface InvoiceItem {
  id: ID;
  description: string;
  qty: number;
  unitPrice: Money;
  lineTotal: Money;
  taxRate: number;
}

export interface Invoice extends BaseEntity {
  clientId: ID;
  projectId: ID | null;
  number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  subtotal: Money;
  tax: Money;
  discount: Money;
  total: Money;
  amountPaid: Money;
  dueAt: ISODateString | null;
  issuedAt: ISODateString | null;
  paidAt: ISODateString | null;
  items: InvoiceItem[];
}
