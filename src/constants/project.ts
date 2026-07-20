/**
 * Project & delivery constants — values only (the single source of truth the
 * `@/types/project` unions derive from). Consumed by `@/lib/project-service`
 * when auto-provisioning a project from a paid order.
 *
 * A subset of docs/DATABASE.md's project vocabulary relevant to this sprint:
 * `pending_assignment` is the initial status (project exists, no employee
 * assigned yet) and precedes the docs' `planning` state.
 */

export const PROJECT_STATUS = {
  PENDING_ASSIGNMENT: "pending_assignment",
  PLANNING: "planning",
  ACTIVE: "active",
  ON_HOLD: "on_hold",
  DELIVERED: "delivered",
  CLOSED: "closed",
  CANCELLED: "cancelled",
} as const;

export type ProjectStatusValue = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_PHASE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
} as const;

export type ProjectPhaseStatusValue =
  (typeof PROJECT_PHASE_STATUS)[keyof typeof PROJECT_PHASE_STATUS];

export const PROJECT_TASK_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  IN_REVIEW: "in_review",
  BLOCKED: "blocked",
  DONE: "done",
} as const;

export type ProjectTaskStatusValue =
  (typeof PROJECT_TASK_STATUS)[keyof typeof PROJECT_TASK_STATUS];

export const PROJECT_MILESTONE_STATUS = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  SUBMITTED: "submitted",
  APPROVED: "approved",
  CHANGES_REQUESTED: "changes_requested",
} as const;

export type ProjectMilestoneStatusValue =
  (typeof PROJECT_MILESTONE_STATUS)[keyof typeof PROJECT_MILESTONE_STATUS];

/**
 * Fallback delivery phases, used only when a service has no specific template
 * (see `@/config/project-templates`, the per-service source of truth). Every
 * catalog service currently ships its own template; this remains the safety net
 * for an unknown slug so provisioning never fails.
 */
export const DEFAULT_PROJECT_PHASES = [
  "Discovery",
  "Design",
  "Development",
  "Testing",
  "Review",
  "Deployment",
] as const;

export type DefaultProjectPhase = (typeof DEFAULT_PROJECT_PHASES)[number];

/** Activity-timeline verbs (stable machine keys; `message` carries the prose). */
export const PROJECT_ACTIVITY_VERB = {
  CREATED: "project.created",
  PHASES_GENERATED: "project.phases_generated",
  ASSIGNED: "project.assigned",
  STATUS_CHANGED: "project.status_changed",
  PHASE_STATUS_CHANGED: "project.phase_status_changed",
  PROGRESS_UPDATED: "project.progress_updated",
  MILESTONE_STATUS_CHANGED: "project.milestone_status_changed",
  TASK_STATUS_CHANGED: "project.task_status_changed",
  NOTE_ADDED: "project.note_added",
  ESTIMATE_UPDATED: "project.estimate_updated",
  DELIVERABLE_UPLOADED: "project.deliverable_uploaded",
  DELIVERABLE_STATUS_CHANGED: "project.deliverable_status_changed",
  EMPLOYEE_ASSIGNED: "project.employee_assigned",
  EMPLOYEE_REMOVED: "project.employee_removed",
  MANAGER_CHANGED: "project.manager_changed",
  TASK_ASSIGNED: "project.task_assigned",
  TASK_REASSIGNED: "project.task_reassigned",
} as const;

export type ProjectActivityVerb =
  (typeof PROJECT_ACTIVITY_VERB)[keyof typeof PROJECT_ACTIVITY_VERB];

/**
 * Timeline verbs that are INTERNAL — they concern team staffing (who is assigned
 * to what) and must never surface on the client dashboard. The client timeline
 * reader filters these out. They still flow to admin/employee views and realtime.
 */
export const INTERNAL_ACTIVITY_VERBS: ReadonlySet<ProjectActivityVerb> = new Set([
  PROJECT_ACTIVITY_VERB.EMPLOYEE_ASSIGNED,
  PROJECT_ACTIVITY_VERB.EMPLOYEE_REMOVED,
  PROJECT_ACTIVITY_VERB.MANAGER_CHANGED,
  PROJECT_ACTIVITY_VERB.TASK_ASSIGNED,
  PROJECT_ACTIVITY_VERB.TASK_REASSIGNED,
]);

/** True when a timeline verb must be hidden from client-facing surfaces. */
export function isInternalActivityVerb(verb: ProjectActivityVerb): boolean {
  return INTERNAL_ACTIVITY_VERBS.has(verb);
}

/** Kind of deliverable: an uploaded file (bytes in storage) or an external link. */
export const DELIVERABLE_KIND = {
  FILE: "file",
  LINK: "link",
} as const;

export type DeliverableKindValue =
  (typeof DELIVERABLE_KIND)[keyof typeof DELIVERABLE_KIND];

/** Review status of a deliverable. Admin uploads start `pending`. */
export const DELIVERABLE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type DeliverableStatusValue =
  (typeof DELIVERABLE_STATUS)[keyof typeof DELIVERABLE_STATUS];

/** Max size (bytes) accepted for a single uploaded deliverable file. */
export const DELIVERABLE_MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Human-readable prefix + length of the generated public Project ID (code). */
export const PROJECT_CODE_PREFIX = "PRJ";
export const PROJECT_CODE_RANDOM_LENGTH = 6;

/**
 * Team-assignment roles. Stored as a plain string on the assignment row (not a
 * DB enum), so future CUSTOM roles need no migration — an unknown value simply
 * renders via `titleCase`. These are the built-in options the admin UI offers.
 */
export const ASSIGNMENT_ROLE = {
  PROJECT_MANAGER: "project_manager",
  FRONTEND_DEVELOPER: "frontend_developer",
  BACKEND_DEVELOPER: "backend_developer",
  FULL_STACK_DEVELOPER: "full_stack_developer",
  UI_UX_DESIGNER: "ui_ux_designer",
  QA_ENGINEER: "qa_engineer",
  DEVOPS_ENGINEER: "devops_engineer",
  SEO_SPECIALIST: "seo_specialist",
  DIGITAL_MARKETER: "digital_marketer",
  CONTENT_WRITER: "content_writer",
} as const;

export type AssignmentRoleValue =
  (typeof ASSIGNMENT_ROLE)[keyof typeof ASSIGNMENT_ROLE];

/** Lifecycle of a project assignment. `active` unless the member is removed. */
export const ASSIGNMENT_STATUS = {
  ACTIVE: "active",
  REMOVED: "removed",
} as const;

export type AssignmentStatusValue =
  (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

/** Task priority. Plain string (no DB enum) so it stays cheaply extensible. */
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export type TaskPriorityValue = (typeof TASK_PRIORITY)[keyof typeof TASK_PRIORITY];
