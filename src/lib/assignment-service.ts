/**
 * Assignment service — the Team Assignment Engine.
 *
 * Connects Projects → Assignments → Employees → Tasks. One project has many
 * assigned members; one employee works many projects (`ProjectAssignment` is the
 * join). Task-level ownership lives on `ProjectTask.assigneeId`. The project
 * manager is `Project.managerId`.
 *
 * Every mutation logs through the ONE Timeline Service (`@/lib/timeline-service`)
 * using the assignment verbs, so realtime fan-out to admin/employee/client
 * dashboards happens with zero new plumbing and no second event system. The
 * assignment verbs are marked internal (`INTERNAL_ACTIVITY_VERBS`), so the client
 * timeline reader hides them — clients never see the internal team.
 *
 * Authorization is enforced by the callers (admin server actions); this service
 * is the data seam only. Server-only.
 *
 * Extension points (intentionally NOT implemented): capacity planning, workload
 * calculation, employee availability, and leave management would read from these
 * same assignment rows — `estimatedHours`/`dueDate` on tasks and the active
 * assignment set per employee are the inputs a future scheduler would consume.
 */

import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { timelineService } from "@/lib/timeline-service";
import {
  ASSIGNMENT_STATUS,
  PROJECT_ACTIVITY_VERB,
  PROJECT_TASK_STATUS,
  type AssignmentRoleValue,
  type TaskPriorityValue,
} from "@/constants/project";

/** Any Prisma client (base or a `$transaction` tx) — server-only. */
type Db = PrismaClient | Prisma.TransactionClient;

/** Short display name for a user, for timeline messages (never client-visible). */
function displayName(user: { name: string | null; email: string } | null): string {
  if (!user) return "someone";
  return user.name?.trim() || user.email;
}

/** Fetch a user's name/email for message building. */
async function userLabel(db: Db, userId: string | null): Promise<string> {
  if (!userId) return "someone";
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });
  return displayName(user);
}

/**
 * Assign an employee to a project in a given role (or reactivate/reassign an
 * existing removed assignment for the same employee+role). Idempotent for an
 * already-active assignment. Returns the assignment id.
 */
export async function assignEmployee(
  input: {
    projectId: string;
    employeeId: string;
    role: AssignmentRoleValue | string;
    assignedById: string | null;
    notes?: string | null;
  },
  db: Db = prisma
): Promise<string> {
  const { projectId, employeeId, role, assignedById, notes } = input;

  const existing = await db.projectAssignment.findUnique({
    where: { projectId_employeeId_role: { projectId, employeeId, role } },
    select: { id: true, status: true },
  });

  // Already actively assigned in this role — no-op, no duplicate timeline noise.
  if (existing && existing.status === ASSIGNMENT_STATUS.ACTIVE) return existing.id;

  const assignment = existing
    ? await db.projectAssignment.update({
        where: { id: existing.id },
        data: {
          status: ASSIGNMENT_STATUS.ACTIVE,
          assignedById,
          notes: notes ?? null,
        },
        select: { id: true },
      })
    : await db.projectAssignment.create({
        data: {
          projectId,
          employeeId,
          role,
          status: ASSIGNMENT_STATUS.ACTIVE,
          assignedById,
          notes: notes ?? null,
        },
        select: { id: true },
      });

  const who = await userLabel(db, employeeId);
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.EMPLOYEE_ASSIGNED,
      message: `${who} assigned as ${role.replace(/_/g, " ")}.`,
      actorId: assignedById,
      metadata: { assignmentId: assignment.id, employeeId, role },
    },
    db
  );

  return assignment.id;
}

/**
 * Remove an employee from a project (soft — marks the assignment `removed` so the
 * history is preserved). No-op if there is no active assignment for that role.
 */
export async function removeEmployee(
  input: {
    projectId: string;
    employeeId: string;
    role: AssignmentRoleValue | string;
    actorId: string | null;
  },
  db: Db = prisma
): Promise<void> {
  const { projectId, employeeId, role, actorId } = input;

  const existing = await db.projectAssignment.findUnique({
    where: { projectId_employeeId_role: { projectId, employeeId, role } },
    select: { id: true, status: true },
  });
  if (!existing || existing.status !== ASSIGNMENT_STATUS.ACTIVE) return;

  await db.projectAssignment.update({
    where: { id: existing.id },
    data: { status: ASSIGNMENT_STATUS.REMOVED },
  });

  const who = await userLabel(db, employeeId);
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.EMPLOYEE_REMOVED,
      message: `${who} removed from ${role.replace(/_/g, " ")}.`,
      actorId,
      metadata: { assignmentId: existing.id, employeeId, role },
    },
    db
  );
}

/**
 * Reassign a project role from one employee to another: remove the outgoing
 * member and assign the incoming one, atomically. Both timeline events fire.
 */
export async function reassignEmployee(
  input: {
    projectId: string;
    fromEmployeeId: string;
    toEmployeeId: string;
    role: AssignmentRoleValue | string;
    assignedById: string | null;
    notes?: string | null;
  },
  db: Db = prisma
): Promise<string> {
  const run = async (tx: Db) => {
    await removeEmployee(
      {
        projectId: input.projectId,
        employeeId: input.fromEmployeeId,
        role: input.role,
        actorId: input.assignedById,
      },
      tx
    );
    return assignEmployee(
      {
        projectId: input.projectId,
        employeeId: input.toEmployeeId,
        role: input.role,
        assignedById: input.assignedById,
        notes: input.notes,
      },
      tx
    );
  };

  if ("$transaction" in db) {
    return (db as PrismaClient).$transaction((tx) => run(tx));
  }
  return run(db);
}

/**
 * Set (or change, or clear) a project's manager. Logs `MANAGER_CHANGED`. No-op if
 * the manager is unchanged. Passing `managerId: null` clears the manager.
 */
export async function setProjectManager(
  input: { projectId: string; managerId: string | null; actorId: string | null },
  db: Db = prisma
): Promise<void> {
  const { projectId, managerId, actorId } = input;

  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { id: true, managerId: true },
  });
  if (!project) throw new Error(`setProjectManager: project ${projectId} not found.`);
  if (project.managerId === managerId) return;

  await db.project.update({ where: { id: projectId }, data: { managerId } });

  const message =
    managerId == null
      ? "Project manager cleared."
      : `${await userLabel(db, managerId)} assigned as project manager.`;
  await timelineService.log(
    {
      projectId,
      verb: PROJECT_ACTIVITY_VERB.MANAGER_CHANGED,
      message,
      actorId,
      metadata: { from: project.managerId, to: managerId },
    },
    db
  );
}

/**
 * Assign (or reassign, or unassign) a task's owner. Changing the assignee always
 * logs a timeline event: `TASK_ASSIGNED` when a task gains an owner it had none,
 * `TASK_REASSIGNED` when moving between owners (or being cleared). No-op if the
 * assignee is unchanged. Stamps `startedAt` when a task first gets an owner while
 * still `todo` (the work is now actionable) — a cheap, reversible extension point
 * for future time tracking.
 */
export async function setTaskAssignee(
  input: { taskId: string; assigneeId: string | null; actorId: string | null },
  db: Db = prisma
): Promise<void> {
  const { taskId, assigneeId, actorId } = input;

  const task = await db.projectTask.findUnique({
    where: { id: taskId },
    select: {
      id: true,
      projectId: true,
      title: true,
      assigneeId: true,
      status: true,
      startedAt: true,
    },
  });
  if (!task) throw new Error(`setTaskAssignee: task ${taskId} not found.`);
  if (task.assigneeId === assigneeId) return;

  const startedAt =
    assigneeId && !task.startedAt && task.status === PROJECT_TASK_STATUS.TODO
      ? new Date()
      : undefined;

  await db.projectTask.update({
    where: { id: taskId },
    data: { assigneeId, startedAt },
  });

  const isFirstAssign = task.assigneeId == null && assigneeId != null;
  const verb = isFirstAssign
    ? PROJECT_ACTIVITY_VERB.TASK_ASSIGNED
    : PROJECT_ACTIVITY_VERB.TASK_REASSIGNED;

  const message =
    assigneeId == null
      ? `Task "${task.title}" unassigned.`
      : isFirstAssign
        ? `Task "${task.title}" assigned to ${await userLabel(db, assigneeId)}.`
        : `Task "${task.title}" reassigned to ${await userLabel(db, assigneeId)}.`;

  await timelineService.log(
    {
      projectId: task.projectId,
      verb,
      message,
      actorId,
      metadata: { taskId, from: task.assigneeId, to: assigneeId },
    },
    db
  );
}

/**
 * Update a task's scheduling metadata (priority / due date / estimated hours).
 * Non-logging: these are planning fields, not staffing events — the realtime
 * layer still refreshes via the surrounding admin action's revalidate. Only the
 * provided fields are changed.
 */
export async function updateTaskPlanning(
  input: {
    taskId: string;
    priority?: TaskPriorityValue | string;
    dueDate?: Date | null;
    estimatedHours?: number | null;
  },
  db: Db = prisma
): Promise<void> {
  const { taskId, priority, dueDate, estimatedHours } = input;
  await db.projectTask.update({
    where: { id: taskId },
    data: {
      priority: priority ?? undefined,
      dueDate: dueDate === undefined ? undefined : dueDate,
      estimatedHours: estimatedHours === undefined ? undefined : estimatedHours,
    },
  });
}

/**
 * List a project's active assignments (INTERNAL — admin/employee only, never
 * exposed to clients). Returns each member with their user label + role.
 */
export async function listProjectAssignments(
  projectId: string,
  db: Db = prisma
): Promise<
  Array<{
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    notes: string | null;
    assignedAt: string;
  }>
> {
  const rows = await db.projectAssignment.findMany({
    where: { projectId, status: ASSIGNMENT_STATUS.ACTIVE },
    orderBy: { assignedAt: "asc" },
    include: { employee: { select: { name: true, email: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    name: r.employee.name ?? r.employee.email,
    email: r.employee.email,
    role: r.role,
    notes: r.notes,
    assignedAt: r.assignedAt.toISOString(),
  }));
}
