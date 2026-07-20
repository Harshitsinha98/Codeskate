/**
 * Project progress engine.
 *
 * Requirement: progress is calculated automatically as
 *   progress = completed phases / total phases.
 *
 * `calculateProgressPct` is the pure formula (easily unit-tested, no I/O).
 * `recomputeProjectProgress` reads the project's phases, applies the formula,
 * persists `progressPct`, and — when it changes — logs the update through the
 * single Timeline Service. It also advances project status past
 * `pending_assignment`/`planning` once work has started, and to `delivered`
 * when every phase is complete.
 *
 * Server-only. Accepts a `$transaction` client so it can run inside the same
 * atomic block as the change that triggered it (e.g. a phase status update).
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timelineService } from "@/lib/timeline-service";
import {
  PROJECT_ACTIVITY_VERB,
  PROJECT_PHASE_STATUS,
  PROJECT_STATUS,
} from "@/constants/project";

type Db = PrismaClient | Prisma.TransactionClient;

/** Pure formula: completed / total, as an integer percentage 0–100. */
export function calculateProgressPct(completedPhases: number, totalPhases: number): number {
  if (totalPhases <= 0) return 0;
  const pct = (completedPhases / totalPhases) * 100;
  return Math.round(Math.max(0, Math.min(100, pct)));
}

export interface ProgressResult {
  completedPhases: number;
  totalPhases: number;
  progressPct: number;
}

/**
 * Recompute and persist a project's progress from its phases. Idempotent — safe
 * to call after any phase change. Logs a timeline entry only when the value
 * actually moves, so the feed isn't spammed with no-op recomputations.
 */
export async function recomputeProjectProgress(
  projectId: string,
  db: Db = prisma,
  actorId: string | null = null
): Promise<ProgressResult> {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, status: true, progressPct: true },
  });
  if (!project) throw new Error(`recomputeProjectProgress: project ${projectId} not found.`);

  const totalPhases = await db.projectPhase.count({ where: { projectId } });
  const completedPhases = await db.projectPhase.count({
    where: { projectId, status: PROJECT_PHASE_STATUS.COMPLETED },
  });

  const progressPct = calculateProgressPct(completedPhases, totalPhases);
  const nextStatus = deriveStatus(project.status, progressPct);

  if (progressPct !== project.progressPct || nextStatus !== project.status) {
    await db.project.update({
      where: { id: projectId },
      data: { progressPct, status: nextStatus },
    });

    if (progressPct !== project.progressPct) {
      await timelineService.log(
        {
          projectId,
          verb: PROJECT_ACTIVITY_VERB.PROGRESS_UPDATED,
          message: `Progress updated to ${progressPct}% (${completedPhases}/${totalPhases} phases complete).`,
          actorId,
          metadata: { completedPhases, totalPhases, progressPct },
        },
        db
      );
    }
  }

  return { completedPhases, totalPhases, progressPct };
}

/**
 * Derive the project status from progress. Never overrides a manually-set
 * terminal/hold state (on_hold, closed, cancelled); only moves the "happy path"
 * statuses forward as work progresses.
 */
function deriveStatus(current: string, progressPct: number): string {
  const autoManaged: string[] = [
    PROJECT_STATUS.PENDING_ASSIGNMENT,
    PROJECT_STATUS.PLANNING,
    PROJECT_STATUS.ACTIVE,
    PROJECT_STATUS.DELIVERED,
  ];
  if (!autoManaged.includes(current)) return current;

  if (progressPct >= 100) return PROJECT_STATUS.DELIVERED;
  if (progressPct > 0) return PROJECT_STATUS.ACTIVE;
  return current;
}
