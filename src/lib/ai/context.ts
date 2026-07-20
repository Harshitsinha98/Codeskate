/**
 * AI context builder — turns EXISTING business data into a compact, SANITIZED,
 * text snapshot for a prompt. This is the only place the AI layer reads the
 * business domain, and it reads through the SAME server readers every dashboard
 * uses (`@/lib/admin-dashboard`, `@/lib/timeline-service`,
 * `@/lib/deliverable-service`) — never new queries, never mutations.
 *
 * Every snapshot is passed through `@/lib/ai/sanitize`: internal staffing verbs
 * are dropped and secret-looking text is redacted, so nothing sensitive can
 * reach a provider. The database and services remain the source of truth; this
 * only projects a read-only view of them.
 *
 * Server-only.
 */

import { getAdminProject, getAdminProjects, getAdminOverview } from "@/lib/admin-dashboard";
import { listProjectDeliverables } from "@/lib/deliverable-service";
import { timelineService } from "@/lib/timeline-service";
import { getClientProjects } from "@/lib/client-dashboard";
import { getEmployeeOverview } from "@/lib/employee-dashboard";
import { sanitizeActivities, redactSecrets } from "@/lib/ai/sanitize";
import {
  PROJECT_PHASE_STATUS,
  PROJECT_TASK_STATUS,
  PROJECT_MILESTONE_STATUS,
} from "@/constants/project";

/** A read-only, sanitized snapshot of one project for prompting. */
export interface ProjectContext {
  code: string;
  name: string;
  serviceType: string;
  status: string;
  progressPct: number;
  estimatedCompletion: string | null;
  currentPhase: string | null;
  phases: { name: string; status: string }[];
  milestones: { name: string; status: string; dueDate: string | null }[];
  openTasks: { title: string; status: string }[];
  blockedTasks: string[];
  deliverables: { title: string; status: string; version: number }[];
  recentActivity: { verb: string; message: string; createdAt: string }[];
  assignmentCount: number;
}

/** The current phase to read as "active": first in-progress, else first open. */
function pickCurrentPhase(phases: { name: string; status: string }[]): string | null {
  const inProgress = phases.find((p) => p.status === PROJECT_PHASE_STATUS.IN_PROGRESS);
  if (inProgress) return inProgress.name;
  const pending = phases.find((p) => p.status !== PROJECT_PHASE_STATUS.COMPLETED);
  return pending?.name ?? null;
}

/**
 * Build a sanitized snapshot for a single project. Returns null if the project
 * does not exist. Internal staffing detail is excluded; only counts survive.
 */
export async function buildProjectContext(
  projectId: string
): Promise<ProjectContext | null> {
  const project = await getAdminProject(projectId);
  if (!project) return null;

  const deliverables = await listProjectDeliverables(projectId);

  const phases = project.phases.map((p) => ({ name: p.name, status: p.status }));
  const milestones = project.phases
    .flatMap((p) => p.milestones)
    .map((m) => ({ name: m.name, status: m.status, dueDate: m.dueDate }));
  const allTasks = project.phases.flatMap((p) => p.tasks);
  const openTasks = allTasks
    .filter((t) => t.status !== PROJECT_TASK_STATUS.DONE)
    .map((t) => ({ title: redactSecrets(t.title), status: t.status }));
  const blockedTasks = allTasks
    .filter((t) => t.status === PROJECT_TASK_STATUS.BLOCKED)
    .map((t) => redactSecrets(t.title));

  return {
    code: project.code,
    name: redactSecrets(project.name),
    serviceType: project.serviceType,
    status: project.status,
    progressPct: project.progressPct,
    estimatedCompletion: project.estimatedCompletion,
    currentPhase: pickCurrentPhase(phases),
    phases,
    milestones,
    openTasks,
    blockedTasks,
    deliverables: deliverables.map((d) => ({
      title: redactSecrets(d.title),
      status: d.status,
      version: d.currentVersion,
    })),
    // `project.timeline` is already client-safe from the reader, but re-filter
    // + redact here as the belt-and-braces AI boundary.
    recentActivity: sanitizeActivities(project.timeline).slice(0, 12),
    assignmentCount: project.assignments.length,
  };
}

/** An agency-wide snapshot for the executive summary / admin digest. */
export interface AgencyContext {
  metrics: {
    totalOrders: number;
    activeProjects: number;
    pendingAssignment: number;
    inProgress: number;
    delivered: number;
  };
  projects: {
    code: string;
    name: string;
    status: string;
    progressPct: number;
    managerName: string | null;
  }[];
  recentActivity: { verb: string; message: string; createdAt: string }[];
  pendingMilestones: number;
  outstandingDeliverables: number;
}

/**
 * Build a sanitized agency-wide snapshot from the admin readers. Aggregate
 * counts only — no per-employee financials or internal notes.
 */
export async function buildAgencyContext(): Promise<AgencyContext> {
  const [overview, projects, recent] = await Promise.all([
    getAdminOverview(),
    getAdminProjects(),
    timelineService.listRecent(15),
  ]);

  // Outstanding deliverables + pending milestones across active projects — cheap
  // aggregate reads across at most the recent project set. Both the project
  // details and their deliverables are fetched in parallel (no N+1 serialization).
  let pendingMilestones = 0;
  let outstandingDeliverables = 0;
  const activeIds = projects.slice(0, 12).map((p) => p.id);
  const details = (await Promise.all(activeIds.map((id) => getAdminProject(id)))).filter(
    (d): d is NonNullable<typeof d> => d !== null
  );
  const deliverablesByProject = await Promise.all(
    details.map((d) => listProjectDeliverables(d.id))
  );
  for (let i = 0; i < details.length; i++) {
    const d = details[i];
    pendingMilestones += d.phases
      .flatMap((p) => p.milestones)
      .filter(
        (m) =>
          m.status !== PROJECT_MILESTONE_STATUS.APPROVED &&
          m.status !== PROJECT_MILESTONE_STATUS.SUBMITTED
      ).length;
    outstandingDeliverables += deliverablesByProject[i].filter(
      (x) => x.status === "pending"
    ).length;
  }

  return {
    metrics: overview.metrics,
    projects: projects.slice(0, 20).map((p) => ({
      code: p.code,
      name: redactSecrets(p.serviceTitle),
      status: p.status,
      progressPct: p.progressPct,
      managerName: p.managerName,
    })),
    recentActivity: sanitizeActivities(recent).slice(0, 12),
    pendingMilestones,
    outstandingDeliverables,
  };
}

/** A per-client snapshot for the client daily digest (own projects only). */
export interface ClientContext {
  projects: { code: string; name: string; status: string; progressPct: number }[];
  recentActivity: { verb: string; message: string; createdAt: string }[];
}

export async function buildClientContext(clientId: string): Promise<ClientContext> {
  const projects = await getClientProjects(clientId);
  const activity = await timelineService.listRecent(
    15,
    projects.map((p) => p.id)
  );
  return {
    projects: projects.map((p) => ({
      code: p.code,
      name: redactSecrets(p.name),
      status: p.status,
      progressPct: p.progressPct,
    })),
    recentActivity: sanitizeActivities(activity).slice(0, 12),
  };
}

/** A per-employee snapshot for the employee daily digest (assigned work only). */
export interface EmployeeContext {
  assignedProjectCount: number;
  openTaskCount: number;
  todaysTaskCount: number;
  pendingDeliverableCount: number;
  recentActivity: { verb: string; message: string; createdAt: string }[];
  tasks: { title: string; status: string }[];
}

export async function buildEmployeeContext(
  employeeId: string
): Promise<EmployeeContext> {
  const overview = await getEmployeeOverview(employeeId);
  return {
    assignedProjectCount: overview.assignedProjects.length,
    openTaskCount: overview.assignedTasks.length,
    todaysTaskCount: overview.todaysWork.length,
    pendingDeliverableCount: overview.pendingDeliverables.length,
    recentActivity: sanitizeActivities(overview.recentActivity).slice(0, 12),
    tasks: overview.assignedTasks
      .slice(0, 15)
      .map((t) => ({ title: redactSecrets(t.title), status: t.status })),
  };
}
