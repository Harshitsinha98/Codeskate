/**
 * Notification preferences — per-user, per-channel toggles.
 *
 * Only the in-app channel is honored today; email / WhatsApp / push rows can be
 * stored and toggled but no provider consumes them yet (see the disabled
 * providers in `@/lib/notifications/provider`). Absence of a row means "channel
 * default": in-app ON, all others OFF. This keeps the UI and storage ready for a
 * future provider with zero migration.
 *
 * Server-only.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  NOTIFICATION_CHANNEL,
  type NotificationChannelValue,
} from "@/constants/notification";

type Db = PrismaClient | Prisma.TransactionClient;

/** The default enabled-state for a channel when the user has no explicit row. */
const CHANNEL_DEFAULT: Record<NotificationChannelValue, boolean> = {
  [NOTIFICATION_CHANNEL.IN_APP]: true,
  [NOTIFICATION_CHANNEL.EMAIL]: false,
  [NOTIFICATION_CHANNEL.WHATSAPP]: false,
  [NOTIFICATION_CHANNEL.PUSH]: false,
};

/** Whether a channel can actually be toggled on today (only in-app is live). */
const CHANNEL_IMPLEMENTED: Record<NotificationChannelValue, boolean> = {
  [NOTIFICATION_CHANNEL.IN_APP]: true,
  [NOTIFICATION_CHANNEL.EMAIL]: false,
  [NOTIFICATION_CHANNEL.WHATSAPP]: false,
  [NOTIFICATION_CHANNEL.PUSH]: false,
};

export interface NotificationPreferenceState {
  channel: NotificationChannelValue;
  enabled: boolean;
  /** False for channels whose provider is not implemented yet (UI disables them). */
  available: boolean;
}

/**
 * Resolve a user's preference for every channel, merging stored rows over the
 * defaults. Always returns one entry per channel so the UI can render the full
 * set (with unavailable channels shown disabled).
 */
export async function getNotificationPreferences(
  userId: string,
  db: Db = prisma
): Promise<NotificationPreferenceState[]> {
  const rows = await db.notificationPreference.findMany({ where: { userId } });
  const byChannel = new Map(rows.map((r) => [r.channel, r.enabled]));

  return (Object.values(NOTIFICATION_CHANNEL) as NotificationChannelValue[]).map((channel) => ({
    channel,
    enabled: byChannel.get(channel) ?? CHANNEL_DEFAULT[channel],
    available: CHANNEL_IMPLEMENTED[channel],
  }));
}

/**
 * Upsert a user's preference for one channel. Toggling an unimplemented channel
 * is rejected (the provider abstraction exists, but there is nothing to deliver
 * over it yet) so the stored state can never imply a live channel that isn't.
 */
export async function setNotificationPreference(
  userId: string,
  channel: NotificationChannelValue,
  enabled: boolean,
  db: Db = prisma
): Promise<void> {
  if (!CHANNEL_IMPLEMENTED[channel] && enabled) {
    throw new Error(`Channel "${channel}" is not available yet.`);
  }
  await db.notificationPreference.upsert({
    where: { userId_channel: { userId, channel } },
    create: { userId, channel, enabled },
    update: { enabled },
  });
}
