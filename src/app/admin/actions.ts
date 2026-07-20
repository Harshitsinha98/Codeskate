"use server";

/**
 * Admin mutation actions — the write surface for the admin project detail page.
 *
 * Each action: (1) re-checks admin authorization server-side via `requireAdmin`
 * (never trusts the client), (2) delegates to the EXISTING delivery services —
 * `setPhaseStatus` already recomputes progress through the Progress Engine, and
 * every write logs through the single Timeline Service — and (3) revalidates the
 * affected admin routes so the server components re-render with fresh data.
 *
 * No new business logic lives here; this is a thin, authorized, cache-aware
 * wrapper over `@/lib/project-service`.
 */

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-auth";
import {
  setPhaseStatus,
  setProjectStatus,
  setMilestoneStatus,
  setEstimatedCompletion,
  addProjectNote,
} from "@/lib/project-service";
import { setDeliverableStatus } from "@/lib/deliverable-service";
import {
  assignEmployee,
  removeEmployee,
  reassignEmployee,
  setProjectManager,
  setTaskAssignee,
  updateTaskPlanning,
} from "@/lib/assignment-service";
import type { ProjectPhaseStatus, DeliverableStatus } from "@/types/project";
import type {
  ProjectStatusValue,
  ProjectMilestoneStatusValue,
  AssignmentRoleValue,
  TaskPriorityValue,
} from "@/constants/project";

/** Re-render the project detail + the lists that show its status/progress. */
function revalidateProject(projectId: string): void {
  revalidatePath(`/admin/projects/${projectId}`);
  revalidatePath("/admin/projects");
  revalidatePath("/admin");
}

export async function changeProjectStatusAction(
  projectId: string,
  status: ProjectStatusValue
): Promise<void> {
  const admin = await requireAdmin();
  await setProjectStatus(projectId, status, admin.id);
  revalidateProject(projectId);
}

export async function changePhaseStatusAction(
  projectId: string,
  phaseId: string,
  status: ProjectPhaseStatus
): Promise<void> {
  const admin = await requireAdmin();
  // setPhaseStatus recomputes progress via the Progress Engine automatically.
  await setPhaseStatus(phaseId, status, admin.id);
  revalidateProject(projectId);
}

export async function markMilestoneAction(
  projectId: string,
  milestoneId: string,
  status: ProjectMilestoneStatusValue
): Promise<void> {
  const admin = await requireAdmin();
  await setMilestoneStatus(milestoneId, status, admin.id);
  revalidateProject(projectId);
}

export async function editEstimatedCompletionAction(
  projectId: string,
  estimatedDurationDays: number | null
): Promise<void> {
  const admin = await requireAdmin();
  const days =
    estimatedDurationDays == null || Number.isNaN(estimatedDurationDays)
      ? null
      : Math.max(0, Math.round(estimatedDurationDays));
  await setEstimatedCompletion(projectId, days, admin.id);
  revalidateProject(projectId);
}

export async function addTimelineEventAction(
  projectId: string,
  message: string
): Promise<void> {
  const admin = await requireAdmin();
  await addProjectNote(projectId, message, admin.id);
  revalidateProject(projectId);
}

/** Approve or reject a deliverable (admin review). Logs via Timeline Service. */
export async function setDeliverableStatusAction(
  projectId: string,
  deliverableId: string,
  status: DeliverableStatus
): Promise<void> {
  const admin = await requireAdmin();
  await setDeliverableStatus(deliverableId, status, admin.id);
  revalidateProject(projectId);
}

/* ── Team assignment (admin-only) ──────────────────────────────────────────
 * Thin authorized wrappers over the Assignment service. Each logs through the
 * single Timeline Service (internal verbs, hidden from clients) and revalidates
 * admin + employee surfaces so both dashboards reflect the change. Clients are
 * never revalidated with assignment data — their reader filters internal verbs.
 * ------------------------------------------------------------------------- */

/** Also refresh the employee dashboard, which now sees this staffing change. */
function revalidateAssignment(projectId: string): void {
  revalidateProject(projectId);
  revalidatePath(`/employee/projects/${projectId}`);
  revalidatePath("/employee");
}

export async function assignEmployeeAction(
  projectId: string,
  employeeId: string,
  role: AssignmentRoleValue,
  notes?: string | null
): Promise<void> {
  const admin = await requireAdmin();
  await assignEmployee({ projectId, employeeId, role, assignedById: admin.id, notes });
  revalidateAssignment(projectId);
}

export async function removeEmployeeAction(
  projectId: string,
  employeeId: string,
  role: AssignmentRoleValue
): Promise<void> {
  const admin = await requireAdmin();
  await removeEmployee({ projectId, employeeId, role, actorId: admin.id });
  revalidateAssignment(projectId);
}

export async function reassignEmployeeAction(
  projectId: string,
  fromEmployeeId: string,
  toEmployeeId: string,
  role: AssignmentRoleValue,
  notes?: string | null
): Promise<void> {
  const admin = await requireAdmin();
  await reassignEmployee({
    projectId,
    fromEmployeeId,
    toEmployeeId,
    role,
    assignedById: admin.id,
    notes,
  });
  revalidateAssignment(projectId);
}

export async function setProjectManagerAction(
  projectId: string,
  managerId: string | null
): Promise<void> {
  const admin = await requireAdmin();
  await setProjectManager({ projectId, managerId, actorId: admin.id });
  revalidateAssignment(projectId);
}

export async function setTaskAssigneeAction(
  projectId: string,
  taskId: string,
  assigneeId: string | null
): Promise<void> {
  const admin = await requireAdmin();
  await setTaskAssignee({ taskId, assigneeId, actorId: admin.id });
  revalidateAssignment(projectId);
}

export async function updateTaskPlanningAction(
  projectId: string,
  taskId: string,
  planning: {
    priority?: TaskPriorityValue;
    dueDate?: Date | null;
    estimatedHours?: number | null;
  }
): Promise<void> {
  await requireAdmin();
  await updateTaskPlanning({ taskId, ...planning });
  revalidateAssignment(projectId);
}
