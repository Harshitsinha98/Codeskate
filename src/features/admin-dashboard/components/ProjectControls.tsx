"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  changeProjectStatusAction,
  changePhaseStatusAction,
  markMilestoneAction,
  editEstimatedCompletionAction,
  addTimelineEventAction,
} from "@/app/admin/actions";
import {
  PROJECT_STATUS,
  PROJECT_PHASE_STATUS,
  PROJECT_MILESTONE_STATUS,
} from "@/constants/project";
import type { ProjectPhaseStatus } from "@/types/project";
import type {
  ProjectStatusValue,
  ProjectMilestoneStatusValue,
} from "@/constants/project";

const selectClass =
  "rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft outline-none transition-colors focus:border-ink/30 disabled:opacity-60";

const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);
const PHASE_STATUS_OPTIONS = Object.values(PROJECT_PHASE_STATUS);

function labelize(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Change a project's overall status. */
export function ProjectStatusControl({
  projectId,
  current,
}: {
  projectId: string;
  current: ProjectStatusValue;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      className={selectClass}
      defaultValue={current}
      disabled={pending}
      onChange={(e) =>
        start(() => changeProjectStatusAction(projectId, e.target.value as ProjectStatusValue))
      }
    >
      {PROJECT_STATUS_OPTIONS.map((s) => (
        <option key={s} value={s}>
          {labelize(s)}
        </option>
      ))}
    </select>
  );
}

/** Change one phase's status (triggers automatic progress recompute server-side). */
export function PhaseStatusControl({
  projectId,
  phaseId,
  current,
}: {
  projectId: string;
  phaseId: string;
  current: ProjectPhaseStatus;
}) {
  const [pending, start] = useTransition();
  return (
    <span className="inline-flex items-center gap-2">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />}
      <select
        className={selectClass}
        defaultValue={current}
        disabled={pending}
        onChange={(e) =>
          start(() =>
            changePhaseStatusAction(projectId, phaseId, e.target.value as ProjectPhaseStatus)
          )
        }
      >
        {PHASE_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {labelize(s)}
          </option>
        ))}
      </select>
    </span>
  );
}

/** Mark a milestone approved (or move it back to pending). */
export function MilestoneControl({
  projectId,
  milestoneId,
  current,
}: {
  projectId: string;
  milestoneId: string;
  current: ProjectMilestoneStatusValue;
}) {
  const [pending, start] = useTransition();
  const isApproved = current === PROJECT_MILESTONE_STATUS.APPROVED;
  const next: ProjectMilestoneStatusValue = isApproved
    ? PROJECT_MILESTONE_STATUS.PENDING
    : PROJECT_MILESTONE_STATUS.APPROVED;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(() => markMilestoneAction(projectId, milestoneId, next))}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
        isApproved
          ? "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
          : "bg-line/60 text-ink-muted hover:bg-line"
      )}
    >
      {pending && <Loader2 className="h-3 w-3 animate-spin" />}
      {isApproved ? "Approved" : "Mark complete"}
    </button>
  );
}

/** Edit the estimated delivery window (days from start). */
export function EstimatedCompletionControl({
  projectId,
  current,
}: {
  projectId: string;
  current: number | null;
}) {
  const [value, setValue] = useState(current == null ? "" : String(current));
  const [pending, start] = useTransition();

  const save = () => {
    const parsed = value.trim() === "" ? null : Number(value);
    start(() => editEstimatedCompletionAction(projectId, parsed));
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="days"
        className="w-24 rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft outline-none focus:border-ink/30"
      />
      <Button variant="secondary" size="md" onClick={save} disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  );
}

/** Add a free-text timeline event to the project. */
export function AddTimelineEventControl({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    start(() =>
      addTimelineEventAction(projectId, trimmed).then(() => setMessage(""))
    );
  };

  return (
    <div className="flex items-start gap-2">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={2}
        placeholder="Add a timeline note…"
        className="flex-1 resize-none rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink-soft outline-none focus:border-ink/30"
      />
      <Button variant="secondary" size="md" onClick={submit} disabled={pending || !message.trim()}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
      </Button>
    </div>
  );
}
