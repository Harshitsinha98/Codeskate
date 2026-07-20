/**
 * Domain event names for AgencyOS (event-driven backbone).
 * Placeholder foundation — names only; the bus/handlers live in the backend.
 * Source of truth: docs/BACKEND.md §5 (Event-Driven Architecture).
 */

export const EVENTS = {
  // Sales
  LEAD_CAPTURED: "lead.captured",
  DEAL_WON: "deal.won",
  PROPOSAL_ACCEPTED: "proposal.accepted",

  // Commerce & finance
  ORDER_CREATED: "order.created",
  PAYMENT_CAPTURED: "payment.captured",
  INVOICE_PAID: "invoice.paid",
  REFUND_APPROVED: "refund.approved",

  // Delivery
  PROJECT_CREATED: "project.created",
  TASK_UPDATED: "task.updated",
  MILESTONE_APPROVED: "milestone.approved",

  // Engagement & AI
  TICKET_RAISED: "ticket.raised",
  RISK_FLAGGED: "ai.risk.flagged",
  NOTIFICATION_DISPATCHED: "notification.dispatched",
} as const;

export type DomainEvent = (typeof EVENTS)[keyof typeof EVENTS];
