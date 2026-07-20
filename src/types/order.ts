/**
 * Order domain type — interfaces only.
 *
 * Deliberately extends `Timestamps` only, NOT `BaseEntity` (which requires
 * `organizationId`): checkout is a public, pre-auth commerce flow with no
 * tenant/organization context wired through it yet, exactly as `Identity`
 * (see ADR-001) made the same call for the same reason. Reuses
 * `CheckoutBillingInfo`/`CheckoutRequirements` verbatim rather than
 * redefining an equivalent shape.
 */

import type { ID, ISODateString, Money, Timestamps } from "@/types/common";
import type { CheckoutBillingInfo, CheckoutRequirements } from "@/types/checkout";
import type { OrderStatus } from "@/constants/order";

export interface Order extends Timestamps {
  id: ID;
  userId: ID | null;
  serviceSlug: string;
  packageId: string;
  addonIds: string[];
  couponCode: string | null;
  billing: CheckoutBillingInfo;
  requirements: CheckoutRequirements;
  currency: string;
  subtotal: Money;
  discount: Money;
  tax: Money;
  total: Money;
  status: OrderStatus;
}

/** What the client posts to create an order (server recomputes all pricing). */
export interface CreateOrderRequest {
  serviceSlug: string;
  packageId: string;
  addonIds: string[];
  couponCode: string | null;
  billing: CheckoutBillingInfo;
  requirements: CheckoutRequirements;
}

export interface CreateOrderResponse {
  orderId: ID;
  providerOrderId: string;
  provider: "razorpay" | "stripe";
  amount: Money;
  keyId: string;
}

/** What the client posts once the payment attempt has an outcome. */
export type CompleteOrderRequest =
  | {
      outcome: "success";
      providerOrderId: string;
      providerPaymentId: string;
      signature: string;
    }
  | { outcome: "failed"; reason?: string }
  | { outcome: "cancelled" };

export interface CompleteOrderResponse {
  orderId: ID;
  status: OrderStatus;
}
