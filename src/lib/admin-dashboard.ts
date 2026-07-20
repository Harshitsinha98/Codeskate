/**
 * Admin dashboard read layer — server-only, agency-wide queries.
 *
 * The admin surface reads across ALL projects/orders/clients (unlike the
 * client dashboard, which is scoped to one `clientId`). It reuses the same
 * delivery engine: progress is the persisted `Project.progressPct` (never
 * recomputed here), and activity comes through the single Timeline Service
 * (`@/lib/timeline-service`). Human service/package names come from the catalog.
 *
 * Access is gated by the caller (see `@/lib/admin-auth`); these functions
 * assume an already-authorized admin and add no per-row scoping.
 */

import { prisma } from "@/lib/prisma";
import { timelineService } from "@/lib/timeline-service";
import { listProjectAssignments } from "@/lib/assignment-service";
import { isEmployeeEmail } from "@/lib/employee-auth";
import { getService, getPackage } from "@/config/catalog";
import { PROJECT_STATUS, PROJECT_PHASE_STATUS } from "@/constants/project";
import { ORDER_STATUS } from "@/constants/order";
import type {
  ProjectStatus,
  ProjectPhaseStatus,
  ProjectMilestoneStatus,
  ProjectTaskStatus,
  ProjectActivity,
} from "@/types/project";
import type { OrderStatus } from "@/constants/order";
import type { PaymentStatus } from "@/types/payment";

/* ── View models ─────────────────────────────────────────────────────────── */

export interface AdminMetrics {
  totalOrders: number;
  activeProjects: number;
  pendingAssignment: number;
  inProgress: number;
  delivered: number;
}

export interface AdminPaymentRow {
  id: string;
  orderId: string;
  provider: string;
  status: PaymentStatus;
  amountMinor: number;
  currency: string;
  createdAt: string;
  clientName: string | null;
}

export interface AdminOverview {
  metrics: AdminMetrics;
  recentPayments: AdminPaymentRow[];
  recentActivity: ProjectActivity[];
}

export interface AdminProjectRow {
  id: string;
  code: string;
  clientName: string | null;
  clientId: string | null;
  serviceTitle: string;
  packageName: string | null;
  status: ProjectStatus;
  progressPct: number;
  managerName: string | null;
  createdAt: string;
}

export interface AdminOrderRow {
  id: string;
  serviceTitle: string;
  packageName: string | null;
  clientName: string | null;
  status: OrderStatus;
  totalMinor: number;
  currency: string;
  createdAt: string;
  projectId: string | null;
}

export interface AdminMilestone {
  id: string;
  name: string;
  order: number;
  status: ProjectMilestoneStatus;
  dueDate: string | null;
}

export interface AdminPhase {
  id: string;
  name: string;
  order: number;
  status: ProjectPhaseStatus;
  milestones: AdminMilestone[];
  tasks: AdminTask[];
}

/** A task in the admin view, with its owner + scheduling metadata. */
export interface AdminTask {
  id: string;
  title: string;
  order: number;
  status: ProjectTaskStatus;
  assigneeId: string | null;
  assigneeName: string | null;
  priority: string;
  dueDate: string | null;
  estimatedHours: number | null;
}

/** One active team member on a project (INTERNAL — admin-only). */
export interface AdminAssignment {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: string;
  notes: string | null;
  assignedAt: string;
}

/** A selectable employee for assignment dropdowns (INTERNAL — admin-only). */
export interface EmployeeOption {
  id: string;
  name: string | null;
  email: string;
}

export interface AdminProjectDetail {
  id: string;
  code: string;
  name: string;
  serviceSlug: string;
  serviceTitle: string;
  serviceType: string;
  packageName: string | null;
  status: ProjectStatus;
  progressPct: number;
  estimatedDurationDays: number | null;
  estimatedCompletion: string | null;
  createdAt: string;
  clientId: string | null;
  clientName: string | null;
  clientEmail: string | null;
  managerId: string | null;
  managerName: string | null;
  phases: AdminPhase[];
  assignments: AdminAssignment[];
  timeline: ProjectActivity[];
}

export interface AdminClientProfile {
  id: string;
  name: string | null;
  email: string;
  createdAt: string;
  projects: { id: string; code: string; name: string; status: ProjectStatus; progressPct: number }[];
  orders: { id: string; serviceTitle: string; status: OrderStatus; totalMinor: number; currency: string; createdAt: string }[];
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

const serviceTitleFor = (slug: string): string => getService(slug)?.title ?? slug;
const packageNameFor = (slug: string, packageId: string): string | null =>
  getPackage(slug, packageId)?.name ?? null;

function estimatedCompletion(createdAt: Date, days: number | null): string | null {
  if (days == null) return null;
  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* ── Queries ─────────────────────────────────────────────────────────────── */

/** Dashboard tiles: counts + recent payments + recent cross-project activity. */
export async function getAdminOverview(): Promise<AdminOverview> {
  const [totalOrders, activeProjects, pendingAssignment, inProgress, delivered, payments, recentActivity] =
    await Promise.all([
      prisma.order.count(),
      prisma.project.count({
        where: {
          status: {
            in: [PROJECT_STATUS.PLANNING, PROJECT_STATUS.ACTIVE, PROJECT_STATUS.ON_HOLD],
          },
        },
      }),
      prisma.project.count({ where: { status: PROJECT_STATUS.PENDING_ASSIGNMENT } }),
      prisma.project.count({ where: { status: PROJECT_STATUS.ACTIVE } }),
      prisma.project.count({ where: { status: PROJECT_STATUS.DELIVERED } }),
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { order: { include: { user: { select: { name: true } } } } },
      }),
      timelineService.listRecent(8),
    ]);

  const recentPayments: AdminPaymentRow[] = payments.map((p) => ({
    id: p.id,
    orderId: p.orderId,
    provider: p.provider,
    status: p.status as PaymentStatus,
    amountMinor: p.amountMinor,
    currency: p.currency,
    createdAt: p.createdAt.toISOString(),
    clientName: p.order.user?.name ?? null,
  }));

  return {
    metrics: { totalOrders, activeProjects, pendingAssignment, inProgress, delivered },
    recentPayments,
    recentActivity,
  };
}

/** All projects as table rows, newest first. */
export async function getAdminProjects(): Promise<AdminProjectRow[]> {
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      order: { select: { packageId: true } },
      client: { select: { name: true } },
      manager: { select: { name: true } },
    },
  });

  return projects.map((p) => ({
    id: p.id,
    code: p.code,
    clientName: p.client?.name ?? null,
    clientId: p.clientId,
    serviceTitle: serviceTitleFor(p.serviceSlug),
    packageName: packageNameFor(p.serviceSlug, p.order.packageId),
    status: p.status as ProjectStatus,
    progressPct: p.progressPct,
    managerName: p.manager?.name ?? null,
    createdAt: p.createdAt.toISOString(),
  }));
}

/** A single project with phases/milestones/tasks + timeline (admin view). */
export async function getAdminProject(projectId: string): Promise<AdminProjectDetail | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      order: { select: { packageId: true } },
      client: { select: { name: true, email: true } },
      manager: { select: { name: true } },
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

  const [timeline, assignments] = await Promise.all([
    timelineService.list(project.id),
    listProjectAssignments(project.id),
  ]);

  // Resolve task assignee names in one query (task.assigneeId may point at any
  // employee, not just an assigned member).
  const assigneeIds = Array.from(
    new Set(
      project.phases
        .flatMap((p) => p.tasks)
        .map((t) => t.assigneeId)
        .filter((id): id is string => Boolean(id))
    )
  );
  const assigneeUsers = assigneeIds.length
    ? await prisma.user.findMany({
        where: { id: { in: assigneeIds } },
        select: { id: true, name: true, email: true },
      })
    : [];
  const nameById = new Map(
    assigneeUsers.map((u) => [u.id, u.name ?? u.email] as const)
  );

  const phases: AdminPhase[] = project.phases.map((phase) => ({
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
      order: t.order,
      status: t.status as ProjectTaskStatus,
      assigneeId: t.assigneeId,
      assigneeName: t.assigneeId ? nameById.get(t.assigneeId) ?? null : null,
      priority: t.priority,
      dueDate: t.dueDate?.toISOString() ?? null,
      estimatedHours: t.estimatedHours,
    })),
  }));

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    serviceSlug: project.serviceSlug,
    serviceTitle: serviceTitleFor(project.serviceSlug),
    serviceType: project.serviceType,
    packageName: packageNameFor(project.serviceSlug, project.order.packageId),
    status: project.status as ProjectStatus,
    progressPct: project.progressPct,
    estimatedDurationDays: project.estimatedDurationDays,
    estimatedCompletion: estimatedCompletion(project.createdAt, project.estimatedDurationDays),
    createdAt: project.createdAt.toISOString(),
    clientId: project.clientId,
    clientName: project.client?.name ?? null,
    clientEmail: project.client?.email ?? null,
    managerId: project.managerId,
    managerName: project.manager?.name ?? null,
    phases,
    assignments,
    timeline,
  };
}

/**
 * The roster of users eligible to be assigned to projects/tasks — i.e. everyone
 * on the employee allowlist (admins included). INTERNAL, admin-only. Until the
 * role backend lands there is no `role` column, so we filter the user table
 * through the same `isEmployeeEmail` seam the employee gate uses.
 */
export async function getEmployeeOptions(): Promise<EmployeeOption[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true },
  });
  return users
    .filter((u) => isEmployeeEmail(u.email))
    .map((u) => ({ id: u.id, name: u.name, email: u.email }));
}

/**
 * Orders filtered by status for the Orders tabs. `refunded` is not a current
 * order status (see @/constants/order) — passing it simply returns an empty
 * list, so the tab renders its empty state with no schema change.
 */
export async function getAdminOrders(status?: string): Promise<AdminOrderRow[]> {
  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { name: true } },
      project: { select: { id: true } },
    },
  });

  return orders.map((o) => ({
    id: o.id,
    serviceTitle: serviceTitleFor(o.serviceSlug),
    packageName: packageNameFor(o.serviceSlug, o.packageId),
    clientName: o.user?.name ?? null,
    status: o.status as OrderStatus,
    totalMinor: o.totalMinor,
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    projectId: o.project?.id ?? null,
  }));
}

/** Order status tabs, in display order. `refunded` included per spec (empty). */
export const ADMIN_ORDER_TABS: { key: string; label: string }[] = [
  { key: ORDER_STATUS.PENDING, label: "Pending" },
  { key: ORDER_STATUS.PAID, label: "Paid" },
  { key: ORDER_STATUS.CANCELLED, label: "Cancelled" },
  { key: "refunded", label: "Refunded" },
];

/** A client's profile: their projects + orders. Null if no such user. */
export async function getAdminClient(clientId: string): Promise<AdminClientProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: clientId },
    include: {
      clientProjects: { orderBy: { createdAt: "desc" } },
      orders: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    projects: user.clientProjects.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      status: p.status as ProjectStatus,
      progressPct: p.progressPct,
    })),
    orders: user.orders.map((o) => ({
      id: o.id,
      serviceTitle: serviceTitleFor(o.serviceSlug),
      status: o.status as OrderStatus,
      totalMinor: o.totalMinor,
      currency: o.currency,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}
