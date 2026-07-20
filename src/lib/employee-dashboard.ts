/**
 * Employee dashboard read layer — server-only queries scoped to ONE employee.
 *
 * An employee sees only the work assigned to them. "Assigned" means either:
 *   - they are the project's `managerId`, or
 *   - they are the `assigneeId` of at least one task in the project.
 * `employeeProjectIds()` resolves that set once; every other query filters
 * through it so an employee can never read a project they're not on. This is the
 * employee analogue of the `clientId` scoping in `@/lib/client-dashboard`.
 *
 * It reuses the SAME delivery engine as the admin/client dashboards: progress is
 * the persisted `Project.progressPct` (maintained by `@/lib/project-progress`),
 * activity comes through the single Timeline Service (`@/lib/timeline-service`),
 * and deliverables through the Deliverable Service — no new domain models, no
 * recomputation in the read path. Human service/package names come from the
 * catalog. View-model types are co-located, thin projections of the rows the
 * pages render.
 */

import { prisma } from "@/lib/prisma";
import { timelineService } from "@/lib/timeline-service";
import { getService, getPackage } from "@/config/catalog";
import {
  PROJECT_PHASE_STATUS,
  PROJECT_TASK_STATUS,
  DELIVERABLE_STATUS,
  ASSIGNMENT_STATUS,
} from "@/constants/project";
import type {
  ProjectStatus,
  ProjectPhaseStatus,
  ProjectMilestoneStatus,
  ProjectTaskStatus,
  DeliverableStatus,
  ProjectActivity,
} from "@/types/project";

/* ── View models ─────────────────────────────────────────────────────────── */

/** A project summarised for an employee dashboard card / list row. */
export interface EmployeeProjectCard {
  id: string;
  code: string;
  name: string;
  serviceSlug: string;
  serviceTitle: string;
  packageName: string | null;
  status: ProjectStatus;
  progressPct: number;
  currentPhaseName: string | null;
  isManager: boolean;
  myOpenTasks: number;
  createdAt: string;
}

/** A task assigned to the employee, with the project it belongs to. */
export interface EmployeeTaskRow {
  id: string;
  title: string;
  description: string | null;
  status: ProjectTaskStatus;
  projectId: string;
  projectCode: string;
  projectName: string;
  phaseName: string | null;
  updatedAt: string;
}

/** A deliverable awaiting approval, on one of the employee's projects. */
export interface EmployeeDeliverableRow {
  id: string;
  title: string;
  status: DeliverableStatus;
  currentVersion: number;
  projectId: string;
  projectCode: string;
  projectName: string;
  createdAt: string;
}

/** The employee dashboard home payload. */
export interface EmployeeOverview {
  assignedProjects: EmployeeProjectCard[];
  assignedTasks: EmployeeTaskRow[];
  todaysWork: EmployeeTaskRow[];
  pendingDeliverables: EmployeeDeliverableRow[];
  completedTasks: EmployeeTaskRow[];
  recentActivity: ProjectActivity[];
}

/** A phase with its milestones + tasks, for the employee project detail view. */
export interface EmployeeProjectPhase {
  id: string;
  name: string;
  order: number;
  status: ProjectPhaseStatus;
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
    assigneeId: string | null;
    mine: boolean;
  }[];
}

/** The full project detail payload for an employee (work surface). */
export interface EmployeeProjectDetail extends EmployeeProjectCard {
  serviceType: string;
  phases: EmployeeProjectPhase[];
  timeline: ProjectActivity[];
  completedPhases: number;
  totalPhases: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const serviceTitleFor = (slug: string): string => getService(slug)?.title ?? slug;
const packageNameFor = (slug: string, packageId: string): string | null =>
  getPackage(slug, packageId)?.name ?? null;

/**
 * The phase an employee should read as "current": the first in-progress phase,
 * else the first not-yet-completed phase, else null. Assumes ascending `order`.
 */
function currentPhase<T extends { status: string }>(phases: T[]): T | null {
  const inProgress = phases.find((p) => p.status === PROJECT_PHASE_STATUS.IN_PROGRESS);
  if (inProgress) return inProgress;
  const pending = phases.find((p) => p.status !== PROJECT_PHASE_STATUS.COMPLETED);
  return pending ?? null;
}

/** Tasks the employee has NOT finished yet count as "open". */
const OPEN_TASK_STATUSES: ProjectTaskStatus[] = [
  PROJECT_TASK_STATUS.TODO,
  PROJECT_TASK_STATUS.IN_PROGRESS,
  PROJECT_TASK_STATUS.IN_REVIEW,
  PROJECT_TASK_STATUS.BLOCKED,
];

/** Tasks an employee should act on "today": actively started or blocked. */
const TODAY_TASK_STATUSES: ProjectTaskStatus[] = [
  PROJECT_TASK_STATUS.IN_PROGRESS,
  PROJECT_TASK_STATUS.BLOCKED,
];

/* ── Scope ───────────────────────────────────────────────────────────────── */

/**
 * The set of project ids an employee is assigned to — as manager, as the
 * assignee of any task, OR as an active `ProjectAssignment` team member. This is
 * the authorization spine of the whole surface.
 */
export async function employeeProjectIds(employeeId: string): Promise<string[]> {
  const [managed, tasked, assigned] = await Promise.all([
    prisma.project.findMany({ where: { managerId: employeeId }, select: { id: true } }),
    prisma.projectTask.findMany({
      where: { assigneeId: employeeId },
      select: { projectId: true },
      distinct: ["projectId"],
    }),
    prisma.projectAssignment.findMany({
      where: { employeeId, status: ASSIGNMENT_STATUS.ACTIVE },
      select: { projectId: true },
      distinct: ["projectId"],
    }),
  ]);
  return Array.from(
    new Set([
      ...managed.map((p) => p.id),
      ...tasked.map((t) => t.projectId),
      ...assigned.map((a) => a.projectId),
    ])
  );
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

/**
 * All of an employee's assigned projects as cards, newest first. `myOpenTasks`
 * counts the employee's own unfinished tasks in each project.
 */
export async function getEmployeeProjects(employeeId: string): Promise<EmployeeProjectCard[]> {
  const ids = await employeeProjectIds(employeeId);
  if (ids.length === 0) return [];

  const projects = await prisma.project.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { packageId: true } },
      phases: { orderBy: { order: "asc" }, select: { name: true, status: true, order: true } },
      tasks: {
        where: { assigneeId: employeeId },
        select: { status: true },
      },
    },
  });

  return projects.map((p) => {
    const phase = currentPhase(p.phases);
    const myOpenTasks = p.tasks.filter((t) =>
      OPEN_TASK_STATUSES.includes(t.status as ProjectTaskStatus)
    ).length;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      serviceSlug: p.serviceSlug,
      serviceTitle: serviceTitleFor(p.serviceSlug),
      packageName: packageNameFor(p.serviceSlug, p.order.packageId),
      status: p.status as ProjectStatus,
      progressPct: p.progressPct,
      currentPhaseName: phase?.name ?? null,
      isManager: p.managerId === employeeId,
      myOpenTasks,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

/** Map a task row (joined to project + phase) to the list view-model. */
function toTaskRow(row: {
  id: string;
  title: string;
  description: string | null;
  status: string;
  projectId: string;
  updatedAt: Date;
  project: { code: string; name: string };
  phase: { name: string } | null;
}): EmployeeTaskRow {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as ProjectTaskStatus,
    projectId: row.projectId,
    projectCode: row.project.code,
    projectName: row.project.name,
    phaseName: row.phase?.name ?? null,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Dashboard home: assigned projects, the employee's assigned tasks (split into
 * open / today / completed buckets), deliverables pending review on their
 * projects, and a merged recent-activity feed from their projects.
 */
export async function getEmployeeOverview(employeeId: string): Promise<EmployeeOverview> {
  const ids = await employeeProjectIds(employeeId);

  const [assignedProjects, myTasks, pendingDeliverableRows] = await Promise.all([
    getEmployeeProjects(employeeId),
    prisma.projectTask.findMany({
      where: { assigneeId: employeeId },
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { code: true, name: true } },
        phase: { select: { name: true } },
      },
    }),
    ids.length
      ? prisma.deliverable.findMany({
          where: { projectId: { in: ids }, status: DELIVERABLE_STATUS.PENDING },
          orderBy: { createdAt: "desc" },
          take: 12,
          include: { project: { select: { code: true, name: true } } },
        })
      : Promise.resolve([]),
  ]);

  const rows = myTasks.map(toTaskRow);
  const assignedTasks = rows.filter((t) => OPEN_TASK_STATUSES.includes(t.status));
  const todaysWork = rows.filter((t) => TODAY_TASK_STATUSES.includes(t.status));
  const completedTasks = rows.filter((t) => t.status === PROJECT_TASK_STATUS.DONE);

  const pendingDeliverables: EmployeeDeliverableRow[] = pendingDeliverableRows.map((d) => ({
    id: d.id,
    title: d.title,
    status: d.status as DeliverableStatus,
    currentVersion: d.currentVersion,
    projectId: d.projectId,
    projectCode: d.project.code,
    projectName: d.project.name,
    createdAt: d.createdAt.toISOString(),
  }));

  // Recent activity across the employee's projects, via the Timeline Service.
  const recentActivity = ids.length ? await timelineService.listRecent(8, ids) : [];

  return {
    assignedProjects,
    assignedTasks,
    todaysWork,
    pendingDeliverables,
    completedTasks,
    recentActivity,
  };
}

/**
 * A single project's full detail for an employee — but ONLY if they are
 * assigned to it (manager or has a task). Returns null otherwise so the route
 * can 404 without leaking the project's existence. Each task carries `mine` so
 * the UI can highlight the employee's own work. Timeline via the Timeline
 * Service (newest first); progress is the persisted `progressPct`.
 */
export async function getEmployeeProject(
  employeeId: string,
  projectId: string
): Promise<EmployeeProjectDetail | null> {
  const ids = await employeeProjectIds(employeeId);
  if (!ids.includes(projectId)) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
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

  const timeline = await timelineService.list(project.id);

  const phases: EmployeeProjectPhase[] = project.phases.map((phase) => ({
    id: phase.id,
    name: phase.name,
    order: phase.order,
    status: phase.status as ProjectPhaseStatus,
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
      assigneeId: t.assigneeId,
      mine: t.assigneeId === employeeId,
    })),
  }));

  const currentPhaseName = currentPhase(project.phases)?.name ?? null;
  const completedPhases = phases.filter(
    (p) => p.status === PROJECT_PHASE_STATUS.COMPLETED
  ).length;
  const myOpenTasks = phases
    .flatMap((p) => p.tasks)
    .filter((t) => t.mine && OPEN_TASK_STATUSES.includes(t.status)).length;

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    serviceSlug: project.serviceSlug,
    serviceTitle: serviceTitleFor(project.serviceSlug),
    packageName: packageNameFor(project.serviceSlug, project.order.packageId),
    status: project.status as ProjectStatus,
    progressPct: project.progressPct,
    currentPhaseName,
    isManager: project.managerId === employeeId,
    myOpenTasks,
    createdAt: project.createdAt.toISOString(),
    serviceType: project.serviceType,
    phases,
    timeline,
    completedPhases,
    totalPhases: phases.length,
  };
}
