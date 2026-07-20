/**
 * Project service — server-only delivery automation & the Project Engine entry
 * points.
 *
 * When an Order's payment is verified, `createProjectForOrder` provisions the
 * full delivery engagement from the service's project template
 * (`@/config/project-templates`): a unique Project (code = public Project ID),
 * its ordered phases, each phase's default tasks + milestones, the estimated
 * duration, and an opening timeline entry — starting in `pending_assignment`,
 * ready for a later employee-assignment step. Idempotent: an order already
 * carrying a project returns it unchanged (safe on webhook/double-submit).
 *
 * All activity is logged through the single Timeline Service. Progress is
 * recomputed automatically (completed phases / total phases) via
 * `@/lib/project-progress` whenever a phase status changes.
 *
 * Reuses the existing architecture (Prisma singleton, catalog config,
 * constants-as-source-of-truth) — the same shape as `@/lib/order-service`.
 */

import { randomBytes } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getService } from "@/config/catalog";
import { getProjectTemplate, templateDurationDays } from "@/config/project-templates";
import { serviceTypeForSlug } from "@/lib/service-type";
import { timelineService } from "@/lib/timeline-service";
import { recomputeProjectProgress } from "@/lib/project-progress";
import {
  PROJECT_ACTIVITY_VERB,
  PROJECT_CODE_PREFIX,
  PROJECT_CODE_RANDOM_LENGTH,
  PROJECT_MILESTONE_STATUS,
  PROJECT_PHASE_STATUS,
  PROJECT_STATUS,
  PROJECT_TASK_STATUS,
} from "@/constants/project";
import type { ProjectPhaseStatus, ProjectTaskStatus } from "@/types/project";
import type {
  ProjectStatusValue,
  ProjectMilestoneStatusValue,
} from "@/constants/project";

/** Any Prisma client (base or a `$transaction` tx) — server-only. */
type Db = PrismaClient | Prisma.TransactionClient;

// Re-exported for callers that only need slug → serviceType (kept stable).
export { serviceTypeForSlug };

/**
 * Generate a human-facing Project ID like "PRJ-3F9K2A". Crockford-ish base32
 * (no ambiguous 0/O/1/I) from cryptographically-random bytes. Uniqueness is
 * additionally guaranteed by the DB unique constraint + retry below.
 */
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateProjectCode(): string {
  const bytes = randomBytes(PROJECT_CODE_RANDOM_LENGTH);
  let out = "";
  for (let i = 0; i < PROJECT_CODE_RANDOM_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return `${PROJECT_CODE_PREFIX}-${out}`;
}

/** Human name for the auto-created project, derived from the purchased service. */
function projectNameFor(serviceSlug: string, orderCode: string): string {
  const service = getService(serviceSlug);
  const label = service?.title ?? "Project";
  return `${label} — ${orderCode}`;
}

/**
 * Create (or return the existing) project for a verified order, inside a single
 * transaction: project + template phases (each with default tasks + milestones)
 * + opening timeline entry.
 *
 * `db` accepts a transaction client so callers can compose this into their own
 * atomic block (e.g. the payment-completion transaction).
 */
export async function createProjectForOrder(
  orderId: string,
  db: Db = prisma
): Promise<string> {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { project: true },
  });
  if (!order) throw new Error(`createProjectForOrder: order ${orderId} not found.`);

  // Idempotent — an order spawns exactly one project.
  if (order.project) return order.project.id;

  const template = getProjectTemplate(order.serviceSlug);
  const serviceType = serviceTypeForSlug(order.serviceSlug);
  const name = projectNameFor(order.serviceSlug, order.id.slice(-6).toUpperCase());
  const estimatedDurationDays = templateDurationDays(template);

  // Retry on the (astronomically unlikely) code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateProjectCode();
    try {
      // 1. Project + its ordered phases (tasks/milestones need the created ids,
      //    so they're seeded in step 2). `include` returns the phases with ids.
      const project = await db.project.create({
        data: {
          code,
          orderId: order.id,
          clientId: order.userId,
          name,
          serviceSlug: order.serviceSlug,
          serviceType,
          status: PROJECT_STATUS.PENDING_ASSIGNMENT,
          estimatedDurationDays,
          phases: {
            create: template.phases.map((phase, index) => ({
              name: phase.name,
              order: index,
              status: PROJECT_PHASE_STATUS.PENDING,
              estimatedDurationDays: phase.estimatedDurationDays,
            })),
          },
        },
        include: { phases: true },
      });

      // 2. Seed each phase's default tasks + milestones (require projectId AND
      //    phaseId). Match created phases to template phases by `order`.
      const phaseByOrder = new Map(project.phases.map((p) => [p.order, p]));

      const taskRows = template.phases.flatMap((phase, index) => {
        const created = phaseByOrder.get(index);
        if (!created) return [];
        return phase.tasks.map((task, taskIndex) => ({
          projectId: project.id,
          phaseId: created.id,
          title: task.title,
          description: task.description ?? null,
          order: taskIndex,
          status: PROJECT_TASK_STATUS.TODO,
        }));
      });

      const milestoneRows = template.phases.flatMap((phase, index) => {
        const created = phaseByOrder.get(index);
        if (!created) return [];
        return phase.milestones.map((milestone, msIndex) => ({
          projectId: project.id,
          phaseId: created.id,
          name: milestone.name,
          order: msIndex,
          status: PROJECT_MILESTONE_STATUS.PENDING,
          clientVisible: milestone.clientVisible ?? true,
        }));
      });

      if (taskRows.length) await db.projectTask.createMany({ data: taskRows });
      if (milestoneRows.length) await db.projectMilestone.createMany({ data: milestoneRows });

      // 3. Log provisioning through the single Timeline Service.
      await timelineService.log(
        {
          projectId: project.id,
          verb: PROJECT_ACTIVITY_VERB.CREATED,
          message: `Project ${code} created from order ${order.id}. Awaiting team assignment.`,
          actorId: order.userId,
          metadata: {
            orderId: order.id,
            serviceSlug: order.serviceSlug,
            serviceType,
            estimatedDurationDays,
          },
        },
        db
      );
      await timelineService.log(
        {
          projectId: project.id,
          verb: PROJECT_ACTIVITY_VERB.PHASES_GENERATED,
          message: `Generated ${template.phases.length} phases from the ${serviceType} template.`,
          actorId: order.userId,
          metadata: {
            phases: template.phases.map((p) => p.name),
            estimatedDurationDays,
          },
        },
        db
      );

      return project.id;
    } catch (err) {
      if (isUniqueCodeViolation(err) && attempt < 4) continue;
      throw err;
    }
  }
  // Unreachable — the loop either returns or throws.
  throw new Error("createProjectForOrder: exhausted unique code attempts.");
}

/**
 * Update a phase's status and automatically recompute the project's progress.
 * The status change, its timeline entry, and the progress recompute all run in
 * one transaction so the feed and `progressPct` never diverge.
 */
export async function setPhaseStatus(
  phaseId: string,
  status: ProjectPhaseStatus,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const run = async (tx: Db) => {
    const phase = await tx.projectPhase.findUnique({
      where: { id: phaseId },
      select: { id: true, projectId: true, name: true, status: true },
    });
    if (!phase) throw new Error(`setPhaseStatus: phase ${phaseId} not found.`);
    if (phase.status === status) return; // no-op

    const now = new Date();
    await tx.projectPhase.update({
      where: { id: phaseId },
      data: {
        status,
        // Stamp start/end as the phase moves through its lifecycle.
        startDate: status === PROJECT_PHASE_STATUS.IN_PROGRESS ? now : undefined,
        endDate: status === PROJECT_PHASE_STATUS.COMPLETED ? now : undefined,
      },
    });

    await timelineService.log(
      {
        projectId: phase.projectId,
        verb: PROJECT_ACTIVITY_VERB.PHASE_STATUS_CHANGED,
        message: `Phase "${phase.name}" moved to ${status.replace(/_/g, " ")}.`,
        actorId,
        metadata: { phaseId, from: phase.status, to: status },
      },
      tx
    );

    await recomputeProjectProgress(phase.projectId, tx, actorId);
  };

  // Reuse an existing transaction client, or open one.
  if ("$transaction" in db) {
    await (db as PrismaClient).$transaction((tx) => run(tx));
  } else {
    await run(db);
  }
}

/**
 * Update a single task's status and log the change through the single Timeline
 * Service. This is the seam employees use to move their assigned work forward
 * (and to "complete checklist" items — a task IS a checklist item within a
 * phase). No-op if the status is unchanged. Reuses the same activity verb, so
 * the realtime layer fans the change out automatically with zero new plumbing.
 */
export async function setTaskStatus(
  taskId: string,
  status: ProjectTaskStatus,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const task = await db.projectTask.findUnique({
    where: { id: taskId },
    select: { id: true, projectId: true, title: true, status: true },
  });
  if (!task) throw new Error(`setTaskStatus: task ${taskId} not found.`);
  if (task.status === status) return; // no-op

  await db.projectTask.update({ where: { id: taskId }, data: { status } });
  await timelineService.log(
    {
      projectId: task.projectId,
      verb: PROJECT_ACTIVITY_VERB.TASK_STATUS_CHANGED,
      message: `Task "${task.title}" moved to ${status.replace(/_/g, " ")}.`,
      actorId,
      metadata: { taskId, from: task.status, to: status },
    },
    db
  );
}

/** True for a Prisma P2002 unique-constraint violation on the project `code`. */
function isUniqueCodeViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "P2002"
  );
}

/* ── Admin operations ─────────────────────────────────────────────────────
 * Manual, admin-driven mutations. Each reuses the single Timeline Service and,
 * where progress can change, the Progress Engine — never re-implementing either.
 * ------------------------------------------------------------------------- */

/**
 * Manually set a project's status (admin override). Logged to the timeline.
 * The Progress Engine's `deriveStatus` intentionally never overrides
 * on_hold/closed/cancelled, so a manual status sticks until changed again here.
 */
export async function setProjectStatus(
  projectId: string,
  status: ProjectStatusValue,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true },
  });
  if (!project) throw new Error(`setProjectStatus: project ${projectId} not found.`);
  if (project.status === status) return;

  await db.project.update({ where: { id: projectId }, data: { status } });
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.STATUS_CHANGED,
      message: `Status changed to ${status.replace(/_/g, " ")}.`,
      actorId,
      metadata: { from: project.status, to: status },
    },
    db
  );
}

/**
 * Manually set a milestone's status (admin). Logged to the timeline. Stamps
 * `approvedAt` when the milestone is approved.
 */
export async function setMilestoneStatus(
  milestoneId: string,
  status: ProjectMilestoneStatusValue,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const milestone = await db.projectMilestone.findUnique({
    where: { id: milestoneId },
    select: { id: true, projectId: true, name: true, status: true },
  });
  if (!milestone) throw new Error(`setMilestoneStatus: milestone ${milestoneId} not found.`);
  if (milestone.status === status) return;

  await db.projectMilestone.update({
    where: { id: milestoneId },
    data: {
      status,
      approvedAt: status === PROJECT_MILESTONE_STATUS.APPROVED ? new Date() : undefined,
    },
  });
  await timelineService.log(
    {
      projectId: milestone.projectId,
      verb: PROJECT_ACTIVITY_VERB.MILESTONE_STATUS_CHANGED,
      message: `Milestone "${milestone.name}" moved to ${status.replace(/_/g, " ")}.`,
      actorId,
      metadata: { milestoneId, from: milestone.status, to: status },
    },
    db
  );
}

/**
 * Set a project's estimated delivery window (days from creation) — the admin
 * "edit estimated completion" control. `days` is the duration; the UI derives a
 * date from `createdAt + days`. Logged to the timeline.
 */
export async function setEstimatedCompletion(
  projectId: string,
  estimatedDurationDays: number | null,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, estimatedDurationDays: true },
  });
  if (!project) throw new Error(`setEstimatedCompletion: project ${projectId} not found.`);

  await db.project.update({ where: { id: projectId }, data: { estimatedDurationDays } });
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.ESTIMATE_UPDATED,
      message:
        estimatedDurationDays == null
          ? "Estimated completion cleared."
          : `Estimated completion set to ${estimatedDurationDays} day(s) from start.`,
      actorId,
      metadata: { from: project.estimatedDurationDays, to: estimatedDurationDays },
    },
    db
  );
}

/**
 * Add a free-text timeline event to a project (admin note). Thin wrapper over
 * the Timeline Service so the admin UI never writes activity directly.
 */
export async function addProjectNote(
  projectId: string,
  message: string,
  actorId: string | null = null,
  db: Db = prisma
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("addProjectNote: message is empty.");
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.NOTE_ADDED,
      message: trimmed,
      actorId,
    },
    db
  );
}
