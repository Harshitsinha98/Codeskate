/**
 * Payment service — client-side API client for the checkout → payment flow.
 * Replaces the previous placeholder. Talks to the app's own route handlers
 * (`/api/checkout/orders`) which own all pricing + verification server-side.
 */

import type {
  CompleteOrderRequest,
  CompleteOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
} from "@/types/order";

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (json as { error?: { message?: string } } | null)?.error?.message ??
      "Request failed.";
    throw new Error(message);
  }
  return (json as { data: T }).data;
}

export const paymentService = {
  /** Create the server-side order + provider order for the current checkout. */
  createOrder(input: CreateOrderRequest): Promise<CreateOrderResponse> {
    return postJson<CreateOrderResponse>("/api/checkout/orders", input);
  },

  /** Report the payment outcome; the server verifies + transitions the order. */
  completeOrder(
    orderId: string,
    input: CompleteOrderRequest
  ): Promise<CompleteOrderResponse> {
    return postJson<CompleteOrderResponse>(
      `/api/checkout/orders/${orderId}/complete`,
      input
    );
  },
};
