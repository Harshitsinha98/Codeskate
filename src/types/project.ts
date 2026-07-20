/**
 * Project & delivery domain types — interfaces only.
 *
 * Mirrors the lean Prisma `Project`/`ProjectPhase`/`ProjectActivity` models
 * (see prisma/schema.prisma) rather than the fuller docs/DATABASE.md shape:
 * like `Order`/`Identity` (ADR-001), delivery is created from a pre-auth
 * checkout with no tenant/organization context, so these extend `Timestamps`
 * only, NOT `BaseEntity`. Status/phase unions are derived from
 * `@/constants/project` (the single source of truth) — never re-typed here.
 */

import type { ID, ISODateString } from "@/types/common";
import type {
  ProjectStatusValue,
  ProjectPhaseStatusValue,
  ProjectTaskStatusValue,
  ProjectMilestoneStatusValue,
  ProjectActivityVerb,
  DeliverableKindValue,
  DeliverableStatusValue,
} from "@/constants/project";

export type ProjectStatus = ProjectStatusValue;
export type ProjectPhaseStatus = ProjectPhaseStatusValue;
export type ProjectTaskStatus = ProjectTaskStatusValue;
export type ProjectMilestoneStatus = ProjectMilestoneStatusValue;
export type DeliverableKind = DeliverableKindValue;
export type DeliverableStatus = DeliverableStatusValue;
export type ProjectHealth = "green" | "amber" | "red";

export type ServiceType =
  | "website"
  | "app"
  | "seo"
  | "marketing"
  | "branding"
  | "ai_automation"
  | "custom";

export interface Project {
  id: ID;
  /** Human-facing unique Project ID, e.g. "PRJ-3F9K2A". */
  code: string;
  orderId: ID;
  clientId: ID | null;
  managerId: ID | null;
  name: string;
  serviceSlug: string;
  serviceType: ServiceType;
  status: ProjectStatus;
  progressPct: number;
  estimatedDurationDays: number | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProjectPhase {
  id: ID;
  projectId: ID;
  name: string;
  order: number;
  status: ProjectPhaseStatus;
  estimatedDurationDays: number | null;
  startDate: ISODateString | null;
  endDate: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProjectMilestone {
  id: ID;
  projectId: ID;
  phaseId: ID | null;
  name: string;
  order: number;
  status: ProjectMilestoneStatus;
  clientVisible: boolean;
  dueDate: ISODateString | null;
  approvedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProjectTask {
  id: ID;
  projectId: ID;
  phaseId: ID | null;
  title: string;
  description: string | null;
  order: number;
  status: ProjectTaskStatus;
  assigneeId: ID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ProjectActivity {
  id: ID;
  projectId: ID;
  verb: ProjectActivityVerb;
  message: string;
  actorId: ID | null;
  metadata: Record<string, unknown> | null;
  createdAt: ISODateString;
}

/** A project plus its seeded phases + opening timeline entry (creation result). */
export interface ProjectWithDetails extends Project {
  phases: ProjectPhase[];
  activities: ProjectActivity[];
}

/** One immutable version of a deliverable (see prisma `DeliverableVersion`). */
export interface DeliverableVersion {
  id: ID;
  deliverableId: ID;
  version: number;
  storageKey: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  externalUrl: string | null;
  note: string | null;
  uploadedById: ID | null;
  createdAt: ISODateString;
}

/** A named deliverable artifact plus its version history. */
export interface Deliverable {
  id: ID;
  projectId: ID;
  phaseId: ID | null;
  kind: DeliverableKind;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  clientVisible: boolean;
  currentVersion: number;
  uploadedById: ID | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  versions: DeliverableVersion[];
}

/* ----------------------------------------------------------------------------
 * Project templates — the delivery blueprint per service (see
 * `@/config/project-templates`). Plain data (no DB ids): the engine expands a
 * template into concrete Project/Phase/Milestone/Task rows at provisioning time.
 * ------------------------------------------------------------------------- */

/** A default task within a phase template. */
export interface TaskTemplate {
  title: string;
  description?: string;
}

/** A milestone checkpoint within a phase template. */
export interface MilestoneTemplate {
  name: string;
  /** Whether the client sees this milestone in their portal (default true). */
  clientVisible?: boolean;
}

/** One ordered phase in a service's project template. */
export interface PhaseTemplate {
  name: string;
  estimatedDurationDays: number;
  tasks: TaskTemplate[];
  milestones: MilestoneTemplate[];
}

/** A full delivery blueprint for one service. */
export interface ProjectTemplate {
  serviceSlug: string;
  serviceType: ServiceType;
  phases: PhaseTemplate[];
}
