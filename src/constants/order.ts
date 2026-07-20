/**
 * Order lifecycle constants. Values only.
 * Subset of docs/DATABASE.md `orders.status` relevant to this sprint
 * (fulfilled/refunded arrive with the Projects/Refunds modules later).
 */

export const ORDER_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
