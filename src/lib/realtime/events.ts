/**
 * Realtime event vocabulary — the shape flowing from server mutations to
 * subscribed dashboards over SSE.
 *
 * There is exactly ONE event system. Events are NOT a second source of truth:
 * every mutation in the app already funnels through the Timeline Service
 * (`@/lib/timeline-service`), so realtime events are emitted from that single
 * seam. A `RealtimeEvent` therefore mirrors a timeline entry — it carries the
 * `projectId` (the subscription scope), the originating `verb`, and a light
 * `topic` derived from that verb so clients can react without re-fetching just
 * to learn what changed. The authoritative data still lives in the DB; an event
 * is a signal to re-read, never the payload of record.
 */

import { PROJECT_ACTIVITY_VERB, type ProjectActivityVerb } from "@/constants/project";

/**
 * Coarse subject a change touched. Derived from the timeline verb so the client
 * can decide what to refresh. Kept intentionally small — dashboards mostly just
 * `router.refresh()`, but the topic lets a future consumer be selective.
 */
export const REALTIME_TOPIC = {
  PROJECT: "project",
  PHASE: "phase",
  MILESTONE: "milestone",
  DELIVERABLE: "deliverable",
  TIMELINE: "timeline",
  /** A personal notification for one user (scoped via a `user:<id>` sentinel). */
  NOTIFICATION: "notification",
  /** A sales CRM change (scoped via a `crm` sentinel projectId — agency-wide). */
  CRM: "crm",
  /** A finance/billing change (scoped via a `billing` sentinel projectId — agency-wide). */
  BILLING: "billing",
} as const;

export type RealtimeTopic = (typeof REALTIME_TOPIC)[keyof typeof REALTIME_TOPIC];

/** Server → client event. `id` + `createdAt` come from the timeline row. */
export interface RealtimeEvent {
  /** Timeline entry id — also used as the SSE event id for resumption. */
  id: string;
  /** Subscription scope: which project this change belongs to. */
  projectId: string;
  topic: RealtimeTopic;
  verb: ProjectActivityVerb;
  message: string;
  actorId: string | null;
  createdAt: string;
}

const V = PROJECT_ACTIVITY_VERB;

/** Map a timeline verb to its coarse realtime topic. */
export function topicForVerb(verb: ProjectActivityVerb): RealtimeTopic {
  switch (verb) {
    case V.PHASE_STATUS_CHANGED:
      return REALTIME_TOPIC.PHASE;
    case V.MILESTONE_STATUS_CHANGED:
      return REALTIME_TOPIC.MILESTONE;
    case V.DELIVERABLE_UPLOADED:
    case V.DELIVERABLE_STATUS_CHANGED:
      return REALTIME_TOPIC.DELIVERABLE;
    case V.CREATED:
    case V.PHASES_GENERATED:
    case V.ASSIGNED:
    case V.STATUS_CHANGED:
    case V.PROGRESS_UPDATED:
    case V.ESTIMATE_UPDATED:
    case V.EMPLOYEE_ASSIGNED:
    case V.EMPLOYEE_REMOVED:
    case V.MANAGER_CHANGED:
    case V.TASK_ASSIGNED:
    case V.TASK_REASSIGNED:
      return REALTIME_TOPIC.PROJECT;
    default:
      return REALTIME_TOPIC.TIMELINE;
  }
}

/** SSE event name all realtime messages are published under. */
export const REALTIME_SSE_EVENT = "project-activity";
/** SSE comment line used as a keep-alive heartbeat. */
export const REALTIME_HEARTBEAT = ": heartbeat\n\n";
/** Heartbeat interval (ms) — well under typical proxy idle timeouts. */
export const REALTIME_HEARTBEAT_MS = 25_000;
