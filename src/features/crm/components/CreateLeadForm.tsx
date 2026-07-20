"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createLeadAction } from "@/app/admin/crm/actions";
import { LEAD_SOURCE, LEAD_PRIORITY } from "@/constants/crm";
import { crmTitleCase } from "@/features/crm/lib/presentation";

const SOURCES = Object.values(LEAD_SOURCE);
const PRIORITIES = Object.values(LEAD_PRIORITY);

/**
 * New-lead form (collapsible). Thin client wrapper over `createLeadAction` — the
 * lead-service does all validation + side-effects (timeline/notify/realtime). On
 * success it refreshes so the new lead appears in the list without a reload.
 */
export function CreateLeadForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    if (!name || !email) {
      setError("Name and email are required.");
      return;
    }
    const budgetRaw = String(formData.get("budget") ?? "").trim();
    const budgetMinor = budgetRaw ? Math.round(Number(budgetRaw) * 100) : null;
    const closeRaw = String(formData.get("expectedCloseDate") ?? "").trim();

    startTransition(async () => {
      try {
        await createLeadAction({
          name,
          email,
          company: String(formData.get("company") ?? "") || null,
          phone: String(formData.get("phone") ?? "") || null,
          source: formData.get("source") as (typeof SOURCES)[number],
          priority: formData.get("priority") as (typeof PRIORITIES)[number],
          budgetMinor: budgetMinor != null && !Number.isNaN(budgetMinor) ? budgetMinor : null,
          requirements: String(formData.get("requirements") ?? "") || null,
          expectedCloseDate: closeRaw ? new Date(closeRaw) : null,
        });
        setOpen(false);
        router.refresh();
      } catch {
        setError("Could not create the lead. Please try again.");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New lead
      </button>
    );
  }

  return (
    <form action={onSubmit} className="rounded-4xl border border-line bg-surface p-6 shadow-soft">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name *"><input name="name" required className={inputCls} /></Field>
        <Field label="Company"><input name="company" className={inputCls} /></Field>
        <Field label="Email *"><input name="email" type="email" required className={inputCls} /></Field>
        <Field label="Phone"><input name="phone" className={inputCls} /></Field>
        <Field label="Source">
          <select name="source" defaultValue={LEAD_SOURCE.WEBSITE} className={inputCls}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{crmTitleCase(s)}</option>
            ))}
          </select>
        </Field>
        <Field label="Priority">
          <select name="priority" defaultValue={LEAD_PRIORITY.MEDIUM} className={inputCls}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{crmTitleCase(p)}</option>
            ))}
          </select>
        </Field>
        <Field label="Budget (₹)"><input name="budget" type="number" min="0" step="1" className={inputCls} /></Field>
        <Field label="Expected close date"><input name="expectedCloseDate" type="date" className={inputCls} /></Field>
        <div className="sm:col-span-2">
          <Field label="Requirements">
            <textarea name="requirements" rows={3} className={cn(inputCls, "resize-y")} />
          </Field>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-medium text-surface transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Create lead
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-ink-muted transition-colors hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputCls =
  "w-full rounded-2xl border border-line bg-base px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink/40";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
