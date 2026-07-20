/**
 * Payment domain types — interfaces only.
 *
 * Extends `Timestamps` only, not `BaseEntity` — same reasoning as `Order`
 * (see @/types/order): no organization/tenant context flows through checkout
 * yet. `invoiceId`/`clientId` from the original placeholder are dropped since
 * neither Invoices nor Clients exist yet; `orderId` is the real FK now that
 * Order exists.
 */

import type { ID, ISODateString, Money, Timestamps } from "@/types/common";

export type PaymentProvider = "stripe" | "razorpay";

export type PaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";

export interface Payment extends Timestamps {
  id: ID;
  orderId: ID;
  provider: PaymentProvider;
  providerOrderId: string;
  providerPaymentId: string | null;
  providerSignature: string | null;
  status: PaymentStatus;
  amount: Money;
  method: string | null;
  capturedAt: ISODateString | null;
  failureReason: string | null;
}
