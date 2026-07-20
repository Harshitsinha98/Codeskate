/**
 * Client dashboard read layer — server-only queries scoped to ONE client.
 *
 * The dashboard renders data owned by the delivery engine built in earlier
 * sprints; it never computes progress or invents state. Progress is read from
 * the persisted `Project.progressPct` (maintained by `@/lib/project-progress`),
 * and the activity timeline is read through the single Timeline Service
 * (`@/lib/timeline-service`) — the UI has no other path to activity.
 *
 * Every query is filtered by `clientId` so a signed-in client can only ever see
 * their own orders and projects (a project reader for someone else's project
 * returns null). Human service/package names come from the catalog
 * (`@/config/catalog`). View-model types are co-located here — thin projections
 * of the Prisma rows the pages need, not new domain models.
 */

import { prisma } from "@/lib/prisma";
import { timelineService } from "@/lib/timeline-service";
import { getService, getPackage } from "@/config/catalog";
import { PROJECT_PHASE_STATUS, PROJECT_STATUS, isInternalActivityVerb } from "@/constants/project";
import { ORDER_STATUS } from "@/constants/order";
import type {
  ProjectStatus,
  ProjectPhaseStatus,
  ProjectMilestoneStatus,
  ProjectTaskStatus,
  ProjectActivity,
} from "@/types/project";
import type { OrderStatus } from "@/constants/order";

/* ── View models ─────────────────────────────────────────────────────────── */

/** A project summarised for a dashboard card / list row. */
export interface ClientProjectCard {
  id: string;
  code: string;
  name: string;
  serviceSlug: string;
  serviceTitle: string;
  packageName: string | null;
  status: ProjectStatus;
  progressPct: number;
  currentPhaseName: string | null;
  estimatedDurationDays: number | null;
  estimatedCompletion: string | null;
  createdAt: string;
}

/** A recent order row on the dashboard home. */
export interface ClientOrderRow {
  id: string;
  serviceTitle: string;
  packageName: string | null;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  createdAt: string;
  projectCode: string | null;
}

/** The dashboard home payload. */
export interface ClientOverview {
  activeProjects: ClientProjectCard[];
  recentOrders: ClientOrderRow[];
  recentActivity: ProjectActivity[];
}

/** A phase with its milestones + tasks, for the project detail view. */
export interface ClientProjectPhase {
  id: string;
  name: string;
  order: number;
  status: ProjectPhaseStatus;
  estimatedDurationDays: number | null;
  startDate: string | null;
  endDate: string | null;
  milestones: {
    id: string;
    name: string;
    order: number;
    status: ProjectMilestoneStatus;
    dueDate: string | null;
  }[];
  tasks: {
    id: string;
    title: string;
    description: string | null;
    order: number;
    status: ProjectTaskStatus;
  }[];
}

/** The full project detail payload (read-only). */
export interface ClientProjectDetail extends ClientProjectCard {
  serviceType: string;
  phases: ClientProjectPhase[];
  timeline: ProjectActivity[];
  completedPhases: number;
  totalPhases: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function serviceTitleFor(slug: string): string {
  return getService(slug)?.title ?? slug;
}

function packageNameFor(slug: string, packageId: string): string | null {
  return getPackage(slug, packageId)?.name ?? null;
}

/**
 * The phase a client should read as "current": the first in-progress phase, or
 * the first not-yet-completed phase, or null when every phase is complete.
 * Assumes phases are ordered by `order` ascending.
 */
function currentPhase<T extends { status: string }>(phases: T[]): T | null {
  const inProgress = phases.find((p) => p.status === PROJECT_PHASE_STATUS.IN_PROGRESS);
  if (inProgress) return inProgress;
  const pending = phases.find((p) => p.status !== PROJECT_PHASE_STATUS.COMPLETED);
  return pending ?? null;
}

/** Planned completion date = created + estimated duration (days), as ISO. */
function estimatedCompletion(createdAt: Date, days: number | null): string | null {
  if (days == null) return null;
  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

/** Non-terminal statuses shown under "active projects" on the home screen. */
const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  PROJECT_STATUS.PENDING_ASSIGNMENT,
  PROJECT_STATUS.PLANNING,
  PROJECT_STATUS.ACTIVE,
  PROJECT_STATUS.ON_HOLD,
];

/** Map a project row (with its ordered phases) to a card view-model. */
function toCard(project: {
  id: string;
  code: string;
  name: string;
  serviceSlug: string;
  packageName: string | null;
  status: string;
  progressPct: number;
  estimatedDurationDays: number | null;
  createdAt: Date;
  phases: { name: string; status: string; order: number }[];
}): ClientProjectCard {
  const phase = currentPhase(project.phases);
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    serviceSlug: project.serviceSlug,
    serviceTitle: serviceTitleFor(project.serviceSlug),
    packageName: project.packageName,
    status: project.status as ProjectStatus,
    progressPct: project.progressPct,
    currentPhaseName: phase?.name ?? null,
    estimatedDurationDays: project.estimatedDurationDays,
    estimatedCompletion: estimatedCompletion(project.createdAt, project.estimatedDurationDays),
    createdAt: project.createdAt.toISOString(),
  };
}

/**
 * All of a client's projects as cards, newest first. The package name comes
 * from the linked order (a project stores no packageId itself).
 */
export async function getClientProjects(clientId: string): Promise<ClientProjectCard[]> {
  const projects = await prisma.project.findMany({
    where: { clientId },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { packageId: true } },
      phases: { orderBy: { order: "asc" }, select: { name: true, status: true, order: true } },
    },
  });

  return projects.map((p) =>
    toCard({
      ...p,
      packageName: packageNameFor(p.serviceSlug, p.order.packageId),
    })
  );
}

/**
 * Dashboard home: active projects, recent orders, and a merged recent-activity
 * feed drawn (via the Timeline Service) from the client's active projects.
 */
export async function getClientOverview(clientId: string): Promise<ClientOverview> {
  const [projects, orders] = await Promise.all([
    getClientProjects(clientId),
    prisma.order.findMany({
      where: { userId: clientId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { project: { select: { code: true } } },
    }),
  ]);

  const activeProjects = projects.filter((p) => ACTIVE_PROJECT_STATUSES.includes(p.status));

  const recentOrders: ClientOrderRow[] = orders.map((o) => ({
    id: o.id,
    serviceTitle: serviceTitleFor(o.serviceSlug),
    packageName: packageNameFor(o.serviceSlug, o.packageId),
    status: o.status as OrderStatus,
    totalMinor: o.totalMinor,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    projectCode: o.project?.code ?? null,
  }));

  // Merge each active project's timeline (already newest-first per project),
  // then keep the newest handful across all of them.
  const feeds = await Promise.all(
    activeProjects.map((p) => timelineService.list(p.id))
  );
  const recentActivity = feeds
    .flat()
    .filter((a) => !isInternalActivityVerb(a.verb))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 8);

  return { activeProjects, recentOrders, recentActivity };
}

/**
 * A single project's full detail — but ONLY if it belongs to `clientId`
 * (returns null otherwise, so the route can 404 without leaking existence).
 * Timeline is read through the Timeline Service (newest first); progress is the
 * persisted `progressPct` — never recomputed in the read path.
 */
export async function getClientProject(
  clientId: string,
  projectId: string
): Promise<ClientProjectDetail | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, clientId },
    include: {
      order: { select: { packageId: true } },
      phases: {
        orderBy: { order: "asc" },
        include: {
          milestones: { orderBy: { order: "asc" } },
          tasks: { orderBy: { order: "asc" } },
        },
      },
    },
  });
  if (!project) return null;

  const timeline = (await timelineService.list(project.id)).filter(
    (a) => !isInternalActivityVerb(a.verb)
  );

  const phases: ClientProjectPhase[] = project.phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    order: phase.order,
    status: phase.status as ProjectPhaseStatus,
    estimatedDurationDays: phase.estimatedDurationDays,
    startDate: phase.startDate?.toISOString() ?? null,
    endDate: phase.endDate?.toISOString() ?? null,
    milestones: phase.milestones.map((m) => ({
      id: m.id,
      name: m.name,
      order: m.order,
      status: m.status as ProjectMilestoneStatus,
      dueDate: m.dueDate?.toISOString() ?? null,
    })),
    tasks: phase.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      order: t.order,
      status: t.status as ProjectTaskStatus,
    })),
  }));

  const card = toCard({
    ...project,
    packageName: packageNameFor(project.serviceSlug, project.order.packageId),
    phases: project.phases,
  });

  const completedPhases = phases.filter(
    (p) => p.status === PROJECT_PHASE_STATUS.COMPLETED
  ).length;

  return {
    ...card,
    serviceType: project.serviceType,
    phases,
    timeline,
    completedPhases,
    totalPhases: phases.length,
  };
}
