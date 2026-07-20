/**
 * Notification vocabulary — values only (the single source of truth the
 * notification types derive from). Consumed by the ONE Notification Service
 * (`@/lib/notifications`).
 *
 * Channels model the delivery abstraction: only IN_APP is implemented now; the
 * others exist so the provider registry and per-user preferences are ready for a
 * future email/WhatsApp/push provider with no schema or call-site change.
 */

/** Delivery channels. Only IN_APP is implemented; the rest are abstraction-only. */
export const NOTIFICATION_CHANNEL = {
  IN_APP: "in_app",
  EMAIL: "email",
  WHATSAPP: "whatsapp",
  PUSH: "push",
} as const;

export type NotificationChannelValue =
  (typeof NOTIFICATION_CHANNEL)[keyof typeof NOTIFICATION_CHANNEL];

/** Who a notification is for. Recorded on the row for auditing/filtering. */
export const NOTIFICATION_AUDIENCE = {
  CLIENT: "client",
  EMPLOYEE: "employee",
  ADMIN: "admin",
} as const;

export type NotificationAudienceValue =
  (typeof NOTIFICATION_AUDIENCE)[keyof typeof NOTIFICATION_AUDIENCE];

/**
 * Notification kinds — one per business event the system auto-generates. The
 * dispatcher (`@/lib/notifications`) maps a source event to one of these.
 */
export const NOTIFICATION_TYPE = {
  PAYMENT_SUCCESSFUL: "payment_successful",
  ORDER_CREATED: "order_created",
  PROJECT_CREATED: "project_created",
  PROJECT_ASSIGNED: "project_assigned",
  TASK_ASSIGNED: "task_assigned",
  TASK_REASSIGNED: "task_reassigned",
  DELIVERABLE_UPLOADED: "deliverable_uploaded",
  DELIVERABLE_APPROVED: "deliverable_approved",
  DELIVERABLE_REJECTED: "deliverable_rejected",
  PHASE_CHANGED: "phase_changed",
  MILESTONE_COMPLETED: "milestone_completed",
  PROJECT_COMPLETED: "project_completed",
  MANAGER_COMMENT: "manager_comment",
  /* Sales CRM */
  LEAD_ASSIGNED: "lead_assigned",
  LEAD_STAGE_CHANGED: "lead_stage_changed",
  PROPOSAL_ACCEPTED: "proposal_accepted",
  /* Finance & Billing */
  INVOICE_GENERATED: "invoice_generated",
  REFUND_ISSUED: "refund_issued",
} as const;

export type NotificationTypeValue =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];
