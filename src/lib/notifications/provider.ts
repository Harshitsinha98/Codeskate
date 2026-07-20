/**
 * Notification provider abstraction — the ONE delivery seam, mirroring the
 * realtime (`@/lib/realtime`) and storage (`@/lib/storage`) provider patterns.
 *
 * A business module NEVER creates a notification directly. It calls the
 * Notification Service (`@/lib/notifications/service`), which persists the record
 * and hands it to every ENABLED channel provider. Only the in-app provider is
 * implemented today; email / WhatsApp / push are declared here purely as the
 * abstraction so a future provider drops in with no service or call-site change.
 *
 * The in-app provider is the persistence + realtime channel: the row is already
 * written by the service, so in-app "delivery" is a no-op that simply confirms
 * the channel is on. Realtime fan-out to the notification center rides the
 * EXISTING realtime layer — see `@/lib/notifications/service` `emitRealtime`.
 *
 * Server-only.
 */

import { NOTIFICATION_CHANNEL, type NotificationChannelValue } from "@/constants/notification";

/** The record that a channel provider is asked to deliver. */
export interface DeliverableNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
}

/** The replaceable per-channel delivery contract. */
export interface NotificationProvider {
  readonly channel: NotificationChannelValue;
  /** Whether this channel is active. Only in-app returns true today. */
  isEnabled(): boolean;
  /** Deliver one notification over this channel. Best-effort; must not throw. */
  deliver(notification: DeliverableNotification): Promise<void>;
}

/**
 * In-app channel. The Notification Service has already persisted the row and
 * signals the UI over realtime, so there is nothing more to send here — delivery
 * is a confirmed no-op. This is the only channel enabled in this sprint.
 */
class InAppNotificationProvider implements NotificationProvider {
  readonly channel = NOTIFICATION_CHANNEL.IN_APP;
  isEnabled(): boolean {
    return true;
  }
  async deliver(): Promise<void> {
    /* Persistence + realtime happen in the service; in-app needs no transport. */
  }
}

/**
 * A disabled placeholder channel (email / whatsapp / push). Present only so the
 * registry and preferences enumerate every future channel. `isEnabled()` is
 * false, so the service never calls `deliver()` — the concrete transport is
 * future work and intentionally unimplemented.
 */
class UnimplementedNotificationProvider implements NotificationProvider {
  constructor(readonly channel: NotificationChannelValue) {}
  isEnabled(): boolean {
    return false;
  }
  async deliver(): Promise<void> {
    /* Not implemented — abstraction only. */
  }
}

const globalForNotifications = globalThis as unknown as {
  notificationProviders: NotificationProvider[] | undefined;
};

/**
 * The channel registry. In-app is enabled; the rest are declared-but-disabled so
 * swapping one in later is a single change here with no call-site impact.
 */
export function getNotificationProviders(): NotificationProvider[] {
  if (!globalForNotifications.notificationProviders) {
    globalForNotifications.notificationProviders = [
      new InAppNotificationProvider(),
      new UnimplementedNotificationProvider(NOTIFICATION_CHANNEL.EMAIL),
      new UnimplementedNotificationProvider(NOTIFICATION_CHANNEL.WHATSAPP),
      new UnimplementedNotificationProvider(NOTIFICATION_CHANNEL.PUSH),
    ];
  }
  return globalForNotifications.notificationProviders;
}
