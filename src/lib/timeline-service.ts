/**
 * Timeline Service — the ONE place every module logs project activity.
 *
 * Requirement: "Every module must log through one Timeline Service." Rather than
 * each service writing `db.projectActivity.create(...)` directly, they call
 * `timelineService.log(...)`. This keeps the activity-feed shape consistent,
 * gives a single seam for future fan-out (notifications, audit log, websockets),
 * and makes the timeline queryable through one reader.
 *
 * Realtime: this single seam is ALSO where realtime events are emitted. Because
 * every project/phase/milestone/deliverable/progress mutation already logs here,
 * publishing from `log()` makes every service emit with ZERO duplication and no
 * second event system. The publish is best-effort and never throws, so realtime
 * can never break a persisted write.
 *
 * Server-only. Accepts a base Prisma client or a `$transaction` client so a
 * caller can log inside its own atomic block.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectActivity } from "@/types/project";
import type { ProjectActivityVerb } from "@/constants/project";
import { getRealtime, topicForVerb, type RealtimeEvent } from "@/lib/realtime";
import { dispatchFromTimeline } from "@/lib/notifications/service";

/** Any Prisma client (base or a `$transaction` tx). */
type Db = PrismaClient | Prisma.TransactionClient;

/**
 * Publish a persisted activity as a realtime event. Best-effort: any failure is
 * swallowed so a realtime hiccup never propagates into the caller's write path.
 * Fires after the row exists; subscribers receive a signal to re-read the DB.
 */
function emitRealtime(activity: ProjectActivity): void {
  try {
    const event: RealtimeEvent = {
      id: activity.id,
      projectId: activity.projectId,
      topic: topicForVerb(activity.verb),
      verb: activity.verb,
      message: activity.message,
      actorId: activity.actorId,
      createdAt: activity.createdAt,
    };
    getRealtime().publish(event);
  } catch {
    /* realtime is non-critical — never break the write path */
  }
}

export interface LogActivityInput {
  projectId: string;
  verb: ProjectActivityVerb;
  message: string;
  actorId?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Map a Prisma ProjectActivity row to the domain `ProjectActivity` type. */
function toActivity(row: {
  id: string;
  projectId: string;
  verb: string;
  message: string;
  actorId: string | null;
  metadata: Prisma.JsonValue | null;
  createdAt: Date;
}): ProjectActivity {
  return {
    id: row.id,
    projectId: row.projectId,
    verb: row.verb as ProjectActivityVerb,
    message: row.message,
    actorId: row.actorId,
    metadata: (row.metadata as Record<string, unknown> | null) ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export const timelineService = {
  /** Append one entry to a project's activity timeline. */
  async log(input: LogActivityInput, db: Db = prisma): Promise<ProjectActivity> {
    const row = await db.projectActivity.create({
      data: {
        projectId: input.projectId,
        verb: input.verb,
        message: input.message,
        actorId: input.actorId ?? null,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    const activity = toActivity(row);
    emitRealtime(activity);
    // Auto-generate notifications from this single seam (best-effort — a
    // notification failure must never break the persisted activity write). Uses
    // the same `db` so it composes into an enclosing transaction.
    try {
      await dispatchFromTimeline(activity, db);
    } catch {
      /* notifications are non-critical — never break the write path */
    }
    return activity;
  },

  /** Read a project's timeline, newest first. */
  async list(projectId: string, db: Db = prisma): Promise<ProjectActivity[]> {
    const rows = await db.projectActivity.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toActivity);
  },

  /**
   * Read the most recent activity across ALL projects, newest first (admin
   * overview). Optionally scope to a set of project ids.
   */
  async listRecent(
    limit = 10,
    projectIds?: string[],
    db: Db = prisma
  ): Promise<ProjectActivity[]> {
    const rows = await db.projectActivity.findMany({
      where: projectIds ? { projectId: { in: projectIds } } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map(toActivity);
  },
};

export type TimelineService = typeof timelineService;
