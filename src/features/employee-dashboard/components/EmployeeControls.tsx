"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  updateTaskStatusAction,
  completeTaskAction,
  addTimelineNoteAction,
} from "@/app/employee/actions";
import { PROJECT_TASK_STATUS, DELIVERABLE_KIND } from "@/constants/project";
import type { ProjectTaskStatus, DeliverableKind } from "@/types/project";

const selectClass =
  "rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-soft outline-none transition-colors focus:border-ink/30 disabled:opacity-60";
const inputClass =
  "w-full rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink-soft outline-none transition-colors focus:border-ink/30";

const TASK_STATUS_OPTIONS = Object.values(PROJECT_TASK_STATUS);

function labelize(value: string): string {
  return value
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Update the status of one of the employee's assigned tasks. The server action
 * re-checks assignment and logs through the Timeline Service (→ realtime).
 */
export function TaskStatusControl({
  projectId,
  taskId,
  current,
}: {
  projectId: string;
  taskId: string;
  current: ProjectTaskStatus;
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
            updateTaskStatusAction(projectId, taskId, e.target.value as ProjectTaskStatus)
          )
        }
      >
        {TASK_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {labelize(s)}
          </option>
        ))}
      </select>
    </span>
  );
}

/** One-click "complete checklist item" — moves the task to done. */
export function CompleteTaskControl({
  projectId,
  taskId,
  done,
}: {
  projectId: string;
  taskId: string;
  done: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() => start(() => completeTaskAction(projectId, taskId))}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
        done
          ? "bg-emerald-500/10 text-emerald-700"
          : "bg-line/60 text-ink-muted hover:bg-line"
      )}
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
      {done ? "Done" : "Complete"}
    </button>
  );
}

/** Add a free-text timeline note to an assigned project. */
export function AddTimelineNoteControl({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState("");
  const [pending, start] = useTransition();

  const submit = () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    start(() => addTimelineNoteAction(projectId, trimmed).then(() => setMessage("")));
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

export interface PhaseOption {
  id: string;
  name: string;
}

/**
 * Employee form to upload a NEW deliverable (file or link) to an assigned
 * project. Posts multipart/form-data to the EMPLOYEE upload route, which runs
 * through the storage abstraction + Deliverable Service (logs to the Timeline
 * Service → realtime). Uploaded deliverables stay `pending` for admin approval —
 * employees upload but never approve.
 */
export function EmployeeDeliverableUploadForm({
  projectId,
  phases,
}: {
  projectId: string;
  phases: PhaseOption[];
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [kind, setKind] = useState<DeliverableKind>(DELIVERABLE_KIND.FILE);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    form.set("projectId", projectId);
    form.set("kind", kind);
    setBusy(true);
    try {
      const res = await fetch("/api/employee/deliverables", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? "Upload failed.");
        return;
      }
      formRef.current?.reset();
      setKind(DELIVERABLE_KIND.FILE);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3">
      <div className="flex gap-2">
        <KindTab
          active={kind === DELIVERABLE_KIND.FILE}
          onClick={() => setKind(DELIVERABLE_KIND.FILE)}
          icon={<Upload className="h-3.5 w-3.5" />}
          label="File"
        />
        <KindTab
          active={kind === DELIVERABLE_KIND.LINK}
          onClick={() => setKind(DELIVERABLE_KIND.LINK)}
          icon={<Link2 className="h-3.5 w-3.5" />}
          label="Link"
        />
      </div>

      <input name="title" required placeholder="Title (e.g. Preview URL)" className={inputClass} />
      <input name="description" placeholder="Description (optional)" className={inputClass} />

      {phases.length > 0 && (
        <select name="phaseId" defaultValue="" className={inputClass}>
          <option value="">No specific phase</option>
          {phases.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}

      {kind === DELIVERABLE_KIND.FILE ? (
        <input
          name="file"
          type="file"
          required
          className="block w-full text-sm text-ink-muted file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-1.5 file:text-sm file:text-surface hover:file:bg-ink/90"
        />
      ) : (
        <input
          name="externalUrl"
          type="url"
          required
          placeholder="https://…"
          className={inputClass}
        />
      )}

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input type="checkbox" name="clientVisible" value="true" defaultChecked className="rounded" />
        Visible to client
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="primary" size="md" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload deliverable"}
      </Button>
    </form>
  );
}

function KindTab({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
        active ? "border-ink bg-ink text-surface" : "border-line bg-surface text-ink-muted hover:text-ink"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
