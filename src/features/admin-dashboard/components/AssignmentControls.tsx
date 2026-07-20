"use client";

import { useState, useTransition } from "react";
import { Loader2, UserPlus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  assignEmployeeAction,
  removeEmployeeAction,
  setProjectManagerAction,
  setTaskAssigneeAction,
} from "@/app/admin/actions";
import { ASSIGNMENT_ROLE } from "@/constants/project";
import type { AssignmentRoleValue } from "@/constants/project";
import type { AdminAssignment, EmployeeOption } from "@/lib/admin-dashboard";

const selectClass =
  "rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft outline-none transition-colors focus:border-ink/30 disabled:opacity-60";

const ROLE_OPTIONS = Object.values(ASSIGNMENT_ROLE);

function labelize(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function employeeLabel(e: EmployeeOption): string {
  return e.name?.trim() || e.email;
}

/** Assign or clear the project manager. */
export function ProjectManagerControl({
  projectId,
  currentManagerId,
  employees,
}: {
  projectId: string;
  currentManagerId: string | null;
  employees: EmployeeOption[];
}) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />}
      <select
        className={selectClass}
        defaultValue={currentManagerId ?? ""}
        disabled={pending}
        onChange={(e) =>
          start(() =>
            setProjectManagerAction(projectId, e.target.value === "" ? null : e.target.value)
          )
        }
      >
        <option value="">Unassigned</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {employeeLabel(emp)}
          </option>
        ))}
      </select>
    </span>
  );
}

/** Add a team member to the project in a chosen role. */
export function AssignEmployeeControl({
  projectId,
  employees,
}: {
  projectId: string;
  employees: EmployeeOption[];
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [role, setRole] = useState<AssignmentRoleValue>(ASSIGNMENT_ROLE.FRONTEND_DEVELOPER);
  const [pending, start] = useTransition();

  const submit = () => {
    if (!employeeId) return;
    start(() =>
      assignEmployeeAction(projectId, employeeId, role).then(() => setEmployeeId(""))
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        className={selectClass}
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        disabled={pending}
      >
        <option value="">Select employee…</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {employeeLabel(emp)}
          </option>
        ))}
      </select>
      <select
        className={selectClass}
        value={role}
        onChange={(e) => setRole(e.target.value as AssignmentRoleValue)}
        disabled={pending}
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r} value={r}>
            {labelize(r)}
          </option>
        ))}
      </select>
      <Button variant="secondary" size="md" onClick={submit} disabled={pending || !employeeId}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <UserPlus className="h-4 w-4" />
            Assign
          </span>
        )}
      </Button>
    </div>
  );
}

/** The current team, each removable. */
export function AssignmentList({
  projectId,
  assignments,
}: {
  projectId: string;
  assignments: AdminAssignment[];
}) {
  if (assignments.length === 0) {
    return <p className="text-sm text-ink-faint">No team members assigned yet.</p>;
  }
  return (
    <ul className="space-y-2">
      {assignments.map((a) => (
        <AssignmentRow key={a.id} projectId={projectId} assignment={a} />
      ))}
    </ul>
  );
}

function AssignmentRow({
  projectId,
  assignment,
}: {
  projectId: string;
  assignment: AdminAssignment;
}) {
  const [pending, start] = useTransition();
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3 py-2 text-sm">
      <span className="min-w-0">
        <span className="truncate font-medium text-ink">{assignment.name}</span>
        <span className="ml-2 rounded-full bg-line/60 px-2 py-0.5 text-xs text-ink-muted">
          {labelize(assignment.role)}
        </span>
      </span>
      <button
        type="button"
        aria-label={`Remove ${assignment.name}`}
        disabled={pending}
        onClick={() =>
          start(() =>
            removeEmployeeAction(
              projectId,
              assignment.employeeId,
              assignment.role as AssignmentRoleValue
            )
          )
        }
        className={cn(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-line hover:text-ink disabled:opacity-60"
        )}
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
      </button>
    </li>
  );
}

/** Change (or clear) a single task's owner. */
export function TaskAssigneeControl({
  projectId,
  taskId,
  currentAssigneeId,
  employees,
}: {
  projectId: string;
  taskId: string;
  currentAssigneeId: string | null;
  employees: EmployeeOption[];
}) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />}
      <select
        className={selectClass}
        defaultValue={currentAssigneeId ?? ""}
        disabled={pending}
        onChange={(e) =>
          start(() =>
            setTaskAssigneeAction(projectId, taskId, e.target.value === "" ? null : e.target.value)
          )
        }
      >
        <option value="">Unassigned</option>
        {employees.map((emp) => (
          <option key={emp.id} value={emp.id}>
            {employeeLabel(emp)}
          </option>
        ))}
      </select>
    </span>
  );
}
