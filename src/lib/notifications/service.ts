/**
 * Notification Service — the ONE place notifications are created and read.
 *
 * No business module writes `db.notification.create(...)` directly. Instead:
 *   - Project-scoped events flow through the Timeline Service, which calls
 *     `dispatchFromTimeline()` here on every logged activity (a single seam,
 *     mirroring how realtime is emitted from that same place). This service
 *     decides WHO should be notified (client / employees / admins) and WHAT type,
 *     enforcing the audience rules (clients never see internal staffing events).
 *   - Non-project events (order created, payment successful) call `notify()`
 *     directly from `@/lib/order-service`.
 *
 * Delivery: each notification is persisted, then handed to every ENABLED channel
 * provider (`@/lib/notifications/provider`) — only in-app today. The in-app
 * channel signals the notification center over the EXISTING realtime layer
 * (`@/lib/realtime`) using a dedicated topic, so the badge/list update with no
 * refresh. Realtime publish is best-effort and never breaks the write path.
 *
 * Server-only.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getRealtime, REALTIME_TOPIC, type RealtimeEvent } from "@/lib/realtime";
import { getNotificationProviders } from "@/lib/notifications/provider";
import { getAgencyAdminIds } from "@/lib/notifications/recipients";
import {
  NOTIFICATION_AUDIENCE,
  NOTIFICATION_TYPE,
  type NotificationAudienceValue,
  type NotificationTypeValue,
} from "@/constants/notification";
import { PROJECT_ACTIVITY_VERB } from "@/constants/project";
import type { ProjectActivity } from "@/types/project";

type Db = PrismaClient | Prisma.TransactionClient;

/* ── Domain type ───────────────────────────────────────────────────────────── */

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  audience: NotificationAudienceValue;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  read: boolean;
  archived: boolean;
  createdAt: string;
  readAt: string | null;
}

function toNotification(row: {
  id: string;
  userId: string;
  type: string;
  audience: string;
  title: string;
  body: string | null;
  data: Prisma.JsonValue | null;
  read: boolean;
  archived: boolean;
  createdAt: Date;
  readAt: Date | null;
}): AppNotification {
  return {
    id: row.id,
    userId: row.userId,
    type: row.type as NotificationTypeValue,
    audience: row.audience as NotificationAudienceValue,
    title: row.title,
    body: row.body,
    data: (row.data as Record<string, unknown> | null) ?? null,
    read: row.read,
    archived: row.archived,
    createdAt: row.createdAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
  };
}

/* ── Realtime signal ───────────────────────────────────────────────────────── */

/**
 * Signal the recipient's notification center over the existing realtime layer.
 * We reuse `RealtimeEvent`, tagging it with the reserved `notification` topic and
 * carrying the recipient in `actorId` so the SSE endpoint can scope by user. The
 * `projectId` field carries a sentinel (`user:<id>`) so per-project scope filters
 * ignore it — the notification route matches on the recipient, not the project.
 * Best-effort: any failure is swallowed so realtime never breaks a write.
 */
function emitRealtime(n: AppNotification): void {
  try {
    const event: RealtimeEvent = {
      id: n.id,
      projectId: `user:${n.userId}`,
      topic: REALTIME_TOPIC.NOTIFICATION,
      verb: PROJECT_ACTIVITY_VERB.NOTE_ADDED,
      message: n.title,
      actorId: n.userId,
      createdAt: n.createdAt,
    };
    getRealtime().publish(event);
  } catch {
    /* realtime is non-critical — never break the write path */
  }
}

/* ── Core dispatch ─────────────────────────────────────────────────────────── */

export interface NotifyInput {
  userId: string;
  type: NotificationTypeValue;
  audience: NotificationAudienceValue;
  title: string;
  body?: string | null;
  data?: Record<string, unknown> | null;
}

/**
 * Create ONE notification for one recipient and fan it out to enabled channels.
 * The single low-level entry point every other path funnels through.
 */
export async function notify(input: NotifyInput, db: Db = prisma): Promise<AppNotification> {
  const row = await db.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      audience: input.audience,
      title: input.title,
      body: input.body ?? null,
      data: (input.data ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
  const notification = toNotification(row);

  // Hand to every enabled channel provider (in-app only today). Best-effort.
  for (const provider of getNotificationProviders()) {
    if (!provider.isEnabled()) continue;
    try {
      await provider.deliver({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });
    } catch {
      /* one channel failing must not block the others or the caller */
    }
  }

  emitRealtime(notification);
  return notification;
}

/** Fan one event out to many recipients (deduped), each getting their own row. */
export async function notifyMany(
  userIds: string[],
  input: Omit<NotifyInput, "userId">,
  db: Db = prisma
): Promise<void> {
  const unique = Array.from(new Set(userIds)).filter(Boolean);
  for (const userId of unique) {
    await notify({ ...input, userId }, db);
  }
}

/* ── Timeline → notifications bridge ───────────────────────────────────────── */

/** Map a timeline verb to a notification type + audience routing intent. */
const CLIENT_AUDIENCE = NOTIFICATION_AUDIENCE.CLIENT;
const EMPLOYEE_AUDIENCE = NOTIFICATION_AUDIENCE.EMPLOYEE;
const ADMIN_AUDIENCE = NOTIFICATION_AUDIENCE.ADMIN;

/**
 * Generate notifications from a persisted timeline activity. Called by the
 * Timeline Service after every `log()`. Resolves the project's client + assigned
 * team, then routes per the audience matrix:
 *   - clients get project/deliverable/completion updates, NEVER staffing events,
 *   - employees get task assignment/reassignment + deliverable rejections,
 *   - admins get completion + (via direct notify) payments/orders.
 * Best-effort and defensive: it must never throw into the timeline write path.
 */
export async function dispatchFromTimeline(activity: ProjectActivity, db: Db = prisma): Promise<void> {
  const V = PROJECT_ACTIVITY_VERB;
  const verb = activity.verb;

  // Load the minimal project context for recipient resolution.
  const project = await db.project.findUnique({
    where: { id: activity.projectId },
    select: {
      id: true,
      code: true,
      name: true,
      clientId: true,
      managerId: true,
      status: true,
      assignments: {
        where: { status: "active" },
        select: { employeeId: true },
      },
      tasks: { select: { assigneeId: true } },
    },
  });
  if (!project) return;

  const data = {
    projectId: project.id,
    projectCode: project.code,
    href: `/client/projects/${project.id}`,
  } as Record<string, unknown>;

  const teamIds = Array.from(
    new Set([
      ...(project.managerId ? [project.managerId] : []),
      ...project.assignments.map((a) => a.employeeId),
      ...project.tasks.map((t) => t.assigneeId).filter((id): id is string => Boolean(id)),
    ])
  );

  switch (verb) {
    /* ── Client-facing project + deliverable updates ─────────────────────── */
    case V.PHASE_STATUS_CHANGED:
      if (project.clientId) {
        await notify(
          {
            userId: project.clientId,
            type: NOTIFICATION_TYPE.PHASE_CHANGED,
            audience: CLIENT_AUDIENCE,
            title: `${project.name}: phase updated`,
            body: activity.message,
            data,
          },
          db
        );
      }
      break;

    case V.MILESTONE_STATUS_CHANGED:
      if (project.clientId) {
        await notify(
          {
            userId: project.clientId,
            type: NOTIFICATION_TYPE.MILESTONE_COMPLETED,
            audience: CLIENT_AUDIENCE,
            title: `${project.name}: milestone update`,
            body: activity.message,
            data,
          },
          db
        );
      }
      break;

    case V.DELIVERABLE_UPLOADED:
      if (project.clientId) {
        await notify(
          {
            userId: project.clientId,
            type: NOTIFICATION_TYPE.DELIVERABLE_UPLOADED,
            audience: CLIENT_AUDIENCE,
            title: `${project.name}: new deliverable`,
            body: activity.message,
            data,
          },
          db
        );
      }
      break;

    case V.DELIVERABLE_STATUS_CHANGED: {
      // Approved → client sees it; rejected → the team is notified to redo it.
      const approved = /approved/i.test(activity.message);
      if (approved && project.clientId) {
        await notify(
          {
            userId: project.clientId,
            type: NOTIFICATION_TYPE.DELIVERABLE_APPROVED,
            audience: CLIENT_AUDIENCE,
            title: `${project.name}: deliverable approved`,
            body: activity.message,
            data,
          },
          db
        );
      }
      if (/rejected/i.test(activity.message) && teamIds.length) {
        await notifyMany(
          teamIds,
          {
            type: NOTIFICATION_TYPE.DELIVERABLE_REJECTED,
            audience: EMPLOYEE_AUDIENCE,
            title: `${project.name}: deliverable needs changes`,
            body: activity.message,
            data,
          },
          db
        );
      }
      break;
    }

    case V.STATUS_CHANGED:
      // Project completion → notify client AND admins.
      if (/delivered|closed/i.test(activity.message)) {
        const recipients = [
          ...(project.clientId ? [project.clientId] : []),
        ];
        if (recipients.length) {
          await notifyMany(
            recipients,
            {
              type: NOTIFICATION_TYPE.PROJECT_COMPLETED,
              audience: CLIENT_AUDIENCE,
              title: `${project.name} completed`,
              body: activity.message,
              data,
            },
            db
          );
        }
        const adminIds = await getAgencyAdminIds(db);
        if (adminIds.length) {
          await notifyMany(
            adminIds,
            {
              type: NOTIFICATION_TYPE.PROJECT_COMPLETED,
              audience: ADMIN_AUDIENCE,
              title: `${project.name} completed`,
              body: activity.message,
              data,
            },
            db
          );
        }
      }
      break;

    /* ── Employee-facing staffing events (NEVER sent to clients) ─────────── */
    case V.MANAGER_CHANGED:
      if (project.managerId) {
        await notify(
          {
            userId: project.managerId,
            type: NOTIFICATION_TYPE.PROJECT_ASSIGNED,
            audience: EMPLOYEE_AUDIENCE,
            title: `You are managing ${project.name}`,
            body: activity.message,
            data: { ...data, href: `/employee/projects/${project.id}` },
          },
          db
        );
      }
      break;

    case V.EMPLOYEE_ASSIGNED: {
      const employeeId = (activity.metadata?.employeeId as string | undefined) ?? null;
      if (employeeId) {
        await notify(
          {
            userId: employeeId,
            type: NOTIFICATION_TYPE.PROJECT_ASSIGNED,
            audience: EMPLOYEE_AUDIENCE,
            title: `Assigned to ${project.name}`,
            body: activity.message,
            data: { ...data, href: `/employee/projects/${project.id}` },
          },
          db
        );
      }
      break;
    }

    case V.TASK_ASSIGNED:
    case V.TASK_REASSIGNED: {
      const assigneeId = (activity.metadata?.to as string | undefined) ?? null;
      if (assigneeId) {
        await notify(
          {
            userId: assigneeId,
            type:
              verb === V.TASK_ASSIGNED
                ? NOTIFICATION_TYPE.TASK_ASSIGNED
                : NOTIFICATION_TYPE.TASK_REASSIGNED,
            audience: EMPLOYEE_AUDIENCE,
            title: `${project.name}: task assigned to you`,
            body: activity.message,
            data: { ...data, href: `/employee/projects/${project.id}` },
          },
          db
        );
      }
      break;
    }

    /* ── Project created → notify admins + assigned manager ──────────────── */
    case V.CREATED: {
      const adminIds = await getAgencyAdminIds(db);
      if (adminIds.length) {
        await notifyMany(
          adminIds,
          {
            type: NOTIFICATION_TYPE.PROJECT_CREATED,
            audience: ADMIN_AUDIENCE,
            title: `New project: ${project.name}`,
            body: activity.message,
            data: { ...data, href: `/admin/projects/${project.id}` },
          },
          db
        );
      }
      break;
    }

    default:
      /* Verbs with no notification mapping (progress, phases_generated, notes,
         estimate) intentionally produce no notification. */
      break;
  }
}

/* ── Reads + counter ───────────────────────────────────────────────────────── */

export interface NotificationPage {
  items: AppNotification[];
  unreadCount: number;
  nextCursor: string | null;
}

/**
 * List a user's notifications (newest first, non-archived by default) with cursor
 * pagination. `cursor` is the id of the last item from the previous page.
 */
export async function listNotifications(
  userId: string,
  opts: { limit?: number; cursor?: string | null; includeArchived?: boolean } = {},
  db: Db = prisma
): Promise<NotificationPage> {
  const limit = Math.min(Math.max(opts.limit ?? 20, 1), 100);
  const where = {
    userId,
    ...(opts.includeArchived ? {} : { archived: false }),
  };

  const rows = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(opts.cursor ? { cursor: { id: opts.cursor }, skip: 1 } : {}),
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const unreadCount = await unreadNotificationCount(userId, db);

  return {
    items: page.map(toNotification),
    unreadCount,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/** The unread badge counter — non-archived unread notifications for a user. */
export async function unreadNotificationCount(userId: string, db: Db = prisma): Promise<number> {
  return db.notification.count({ where: { userId, read: false, archived: false } });
}

/* ── Mutations (read / archive / delete) ───────────────────────────────────── */

/** Mark one notification read (scoped to its owner). No-op if already read. */
export async function markNotificationRead(
  userId: string,
  notificationId: string,
  db: Db = prisma
): Promise<void> {
  await db.notification.updateMany({
    where: { id: notificationId, userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

/** Mark ALL of a user's notifications read. */
export async function markAllNotificationsRead(userId: string, db: Db = prisma): Promise<void> {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true, readAt: new Date() },
  });
}

/** Archive one notification (removes it from the default list; keeps history). */
export async function archiveNotification(
  userId: string,
  notificationId: string,
  db: Db = prisma
): Promise<void> {
  await db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { archived: true },
  });
}

/** Permanently delete one notification (owner-scoped). */
export async function deleteNotification(
  userId: string,
  notificationId: string,
  db: Db = prisma
): Promise<void> {
  await db.notification.deleteMany({ where: { id: notificationId, userId } });
}
