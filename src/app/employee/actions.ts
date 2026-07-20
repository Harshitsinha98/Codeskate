"use server";

/**
 * Employee mutation actions — the write surface for the employee workspace.
 *
 * Each action: (1) re-checks employee authorization server-side via
 * `requireEmployee` (never trusts the client), (2) re-checks that the target
 * project is one the employee is ASSIGNED to (manager or task assignee) — an
 * employee can only ever act on their own work, and (3) delegates to the
 * EXISTING delivery services (`@/lib/project-service`), so every write logs
 * through the single Timeline Service and the realtime layer fans it out with
 * zero new plumbing. Finally it revalidates the affected employee routes.
 *
 * Deliberately NARROW: employees may update task status, complete checklist
 * items (a task → done), and add timeline notes. They CANNOT delete projects or
 * timeline entries, approve deliverables or payments, or change pricing — none
 * of those operations are exposed here, and the read layer never surfaces those
 * controls. Deliverable UPLOAD is a separate multipart route
 * (`/api/employee/deliverables`); approval stays admin-only.
 */

import { revalidatePath } from "next/cache";
import { requireEmployee } from "@/lib/employee-auth";
import { employeeProjectIds } from "@/lib/employee-dashboard";
import { setTaskStatus, addProjectNote } from "@/lib/project-service";
import { PROJECT_TASK_STATUS } from "@/constants/project";
import type { ProjectTaskStatus } from "@/types/project";

/** Assert the employee is assigned to this project, or throw. Returns the id. */
async function assertAssigned(employeeId: string, projectId: string): Promise<void> {
  const ids = await employeeProjectIds(employeeId);
  if (!ids.includes(projectId)) {
    throw new Error("Forbidden: not assigned to this project.");
  }
}

/** Re-render the employee detail + the home lists that show status/progress. */
function revalidateProject(projectId: string): void {
  revalidatePath(`/employee/projects/${projectId}`);
  revalidatePath("/employee");
}

/** Move one of the employee's tasks to a new status. Logged via Timeline. */
export async function updateTaskStatusAction(
  projectId: string,
  taskId: string,
  status: ProjectTaskStatus
): Promise<void> {
  const employee = await requireEmployee();
  await assertAssigned(employee.id, projectId);
  await setTaskStatus(taskId, status, employee.id);
  revalidateProject(projectId);
}

/**
 * Complete a checklist item — a convenience wrapper that moves a task to `done`.
 * "Complete Checklist" in the spec: each task within a phase is a checklist item.
 */
export async function completeTaskAction(
  projectId: string,
  taskId: string
): Promise<void> {
  const employee = await requireEmployee();
  await assertAssigned(employee.id, projectId);
  await setTaskStatus(taskId, PROJECT_TASK_STATUS.DONE, employee.id);
  revalidateProject(projectId);
}

/** Add a free-text timeline note to an assigned project. Logged via Timeline. */
export async function addTimelineNoteAction(
  projectId: string,
  message: string
): Promise<void> {
  const employee = await requireEmployee();
  await assertAssigned(employee.id, projectId);
  await addProjectNote(projectId, message, employee.id);
  revalidateProject(projectId);
}
