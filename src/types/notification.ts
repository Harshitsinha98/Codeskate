/**
 * Notification types. Placeholder foundation — interfaces only.
 * Aligned with docs/DATABASE.md (notifications) and docs/BACKEND.md §10.
 */

import type { BaseEntity, ID, ISODateString } from "@/types/common";

export type NotificationChannel = "in_app" | "email" | "push" | "whatsapp" | "sms";

export type NotificationPriority = "low" | "normal" | "high";

export interface Notification extends BaseEntity {
  userId: ID;
  type: string;
  title: string;
  body: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  data: Record<string, unknown> | null;
  readAt: ISODateString | null;
  sentAt: ISODateString | null;
}
