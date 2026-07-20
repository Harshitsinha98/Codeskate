"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload, Link2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { setDeliverableStatusAction } from "@/app/admin/actions";
import { DELIVERABLE_KIND, DELIVERABLE_STATUS } from "@/constants/project";
import type { DeliverableKind, DeliverableStatus } from "@/types/project";

const inputClass =
  "w-full rounded-2xl border border-line bg-surface px-3 py-2 text-sm text-ink-soft outline-none transition-colors focus:border-ink/30";

export interface PhaseOption {
  id: string;
  name: string;
}

/**
 * Admin form to create a NEW deliverable — either an uploaded file or an
 * external link. Posts multipart/form-data to the admin upload route (which
 * runs through the storage abstraction + logs to the Timeline Service), then
 * refreshes the server component.
 */
export function DeliverableUploadForm({
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
      const res = await fetch("/api/admin/deliverables", { method: "POST", body: form });
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

      <input name="title" required placeholder="Title (e.g. Brand Guide)" className={inputClass} />
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

/** Approve / reject a deliverable (admin review). */
export function DeliverableStatusControl({
  projectId,
  deliverableId,
  current,
}: {
  projectId: string;
  deliverableId: string;
  current: DeliverableStatus;
}) {
  const [pending, start] = useTransition();

  function set(status: DeliverableStatus) {
    if (status === current) return;
    start(() => setDeliverableStatusAction(projectId, deliverableId, status));
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-faint" />}
      <button
        type="button"
        disabled={pending}
        onClick={() => set(DELIVERABLE_STATUS.APPROVED)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
          current === DELIVERABLE_STATUS.APPROVED
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-line/60 text-ink-muted hover:bg-line"
        )}
      >
        <Check className="h-3 w-3" />
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => set(DELIVERABLE_STATUS.REJECTED)}
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60",
          current === DELIVERABLE_STATUS.REJECTED
            ? "bg-red-500/10 text-red-600"
            : "bg-line/60 text-ink-muted hover:bg-line"
        )}
      >
        <X className="h-3 w-3" />
        Reject
      </button>
    </div>
  );
}

/** Append a new version to an existing deliverable (file re-upload or new link). */
export function AddVersionControl({
  deliverableId,
  kind,
}: {
  deliverableId: string;
  kind: DeliverableKind;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    form.set("deliverableId", deliverableId);
    form.set("kind", kind);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/deliverables", { method: "POST", body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as
          | { error?: { message?: string } }
          | null;
        setError(body?.error?.message ?? "Upload failed.");
        return;
      }
      formRef.current?.reset();
      setOpen(false);
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-royal-700 hover:text-royal"
      >
        + New version
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mt-2 space-y-2">
      {kind === DELIVERABLE_KIND.FILE ? (
        <input name="file" type="file" required className="block w-full text-xs text-ink-muted" />
      ) : (
        <input name="externalUrl" type="url" required placeholder="https://…" className={inputClass} />
      )}
      <input name="note" placeholder="Version note (optional)" className={inputClass} />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="secondary" size="md" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add version"}
        </Button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
