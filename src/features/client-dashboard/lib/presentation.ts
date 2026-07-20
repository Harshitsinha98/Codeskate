/**
 * Presentation helpers for the client dashboard — label + tone maps and small
 * formatters. Kept as plain data so both server components and the (few) client
 * components share one source of truth for how statuses read and colour.
 *
 * Status *values* still come from `@/constants/project` / `@/constants/order`
 * (the single source of truth); this only maps those values to human labels and
 * Tailwind tone classes for the badges.
 */

import {
  PROJECT_STATUS,
  PROJECT_PHASE_STATUS,
  PROJECT_TASK_STATUS,
  PROJECT_MILESTONE_STATUS,
} from "@/constants/project";
import { ORDER_STATUS } from "@/constants/order";

/** Tailwind classes for a soft status pill (bg + text), matched to the palette. */
export type Tone = string;

const NEUTRAL: Tone = "bg-line/60 text-ink-muted";
const BLUE: Tone = "bg-royal/10 text-royal-700";
const AMBER: Tone = "bg-amber-500/10 text-amber-700";
const GREEN: Tone = "bg-emerald-500/10 text-emerald-700";
const RED: Tone = "bg-red-500/10 text-red-600";

function titleCase(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/* ── Project status ──────────────────────────────────────────────────────── */

const PROJECT_STATUS_LABEL: Record<string, string> = {
  [PROJECT_STATUS.PENDING_ASSIGNMENT]: "Pending Assignment",
  [PROJECT_STATUS.PLANNING]: "Planning",
  [PROJECT_STATUS.ACTIVE]: "Active",
  [PROJECT_STATUS.ON_HOLD]: "On Hold",
  [PROJECT_STATUS.DELIVERED]: "Delivered",
  [PROJECT_STATUS.CLOSED]: "Closed",
  [PROJECT_STATUS.CANCELLED]: "Cancelled",
};

const PROJECT_STATUS_TONE: Record<string, Tone> = {
  [PROJECT_STATUS.PENDING_ASSIGNMENT]: NEUTRAL,
  [PROJECT_STATUS.PLANNING]: BLUE,
  [PROJECT_STATUS.ACTIVE]: BLUE,
  [PROJECT_STATUS.ON_HOLD]: AMBER,
  [PROJECT_STATUS.DELIVERED]: GREEN,
  [PROJECT_STATUS.CLOSED]: NEUTRAL,
  [PROJECT_STATUS.CANCELLED]: RED,
};

/* ── Phase status ────────────────────────────────────────────────────────── */

const PHASE_STATUS_TONE: Record<string, Tone> = {
  [PROJECT_PHASE_STATUS.PENDING]: NEUTRAL,
  [PROJECT_PHASE_STATUS.IN_PROGRESS]: BLUE,
  [PROJECT_PHASE_STATUS.COMPLETED]: GREEN,
};

/* ── Task status ─────────────────────────────────────────────────────────── */

const TASK_STATUS_TONE: Record<string, Tone> = {
  [PROJECT_TASK_STATUS.TODO]: NEUTRAL,
  [PROJECT_TASK_STATUS.IN_PROGRESS]: BLUE,
  [PROJECT_TASK_STATUS.IN_REVIEW]: AMBER,
  [PROJECT_TASK_STATUS.BLOCKED]: RED,
  [PROJECT_TASK_STATUS.DONE]: GREEN,
};

/* ── Milestone status ────────────────────────────────────────────────────── */

const MILESTONE_STATUS_TONE: Record<string, Tone> = {
  [PROJECT_MILESTONE_STATUS.PENDING]: NEUTRAL,
  [PROJECT_MILESTONE_STATUS.IN_PROGRESS]: BLUE,
  [PROJECT_MILESTONE_STATUS.SUBMITTED]: AMBER,
  [PROJECT_MILESTONE_STATUS.APPROVED]: GREEN,
  [PROJECT_MILESTONE_STATUS.CHANGES_REQUESTED]: RED,
};

/* ── Order status ────────────────────────────────────────────────────────── */

const ORDER_STATUS_TONE: Record<string, Tone> = {
  [ORDER_STATUS.PENDING]: AMBER,
  [ORDER_STATUS.PAID]: GREEN,
  [ORDER_STATUS.FAILED]: RED,
  [ORDER_STATUS.CANCELLED]: NEUTRAL,
};

export interface StatusPresentation {
  label: string;
  tone: Tone;
}

export function projectStatusPresentation(status: string): StatusPresentation {
  return { label: PROJECT_STATUS_LABEL[status] ?? titleCase(status), tone: PROJECT_STATUS_TONE[status] ?? NEUTRAL };
}

export function phaseStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: PHASE_STATUS_TONE[status] ?? NEUTRAL };
}

export function taskStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: TASK_STATUS_TONE[status] ?? NEUTRAL };
}

export function milestoneStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: MILESTONE_STATUS_TONE[status] ?? NEUTRAL };
}

export function orderStatusPresentation(status: string): StatusPresentation {
  return { label: titleCase(status), tone: ORDER_STATUS_TONE[status] ?? NEUTRAL };
}

/* ── Formatters ──────────────────────────────────────────────────────────── */

/** e.g. "15 Jul 2026". Stable en-GB day-month-year, no locale surprises. */
export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** Relative-ish short form for the timeline, falling back to an absolute date. */
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatDurationDays(days: number | null): string {
  if (days == null) return "—";
  if (days < 7) return `${days} day${days === 1 ? "" : "s"}`;
  const weeks = Math.round(days / 7);
  return `${weeks} week${weeks === 1 ? "" : "s"}`;
}
