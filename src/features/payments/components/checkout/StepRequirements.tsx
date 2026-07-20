"use client";

import type { CheckoutRequirements } from "@/types/checkout";
import type { RequirementsErrors } from "@/lib/checkout-validation";
import { TextAreaField, TextField } from "@/features/payments/components/checkout/fields";
import { FileUploadField } from "@/features/payments/components/checkout/FileUploadField";

export type { RequirementsErrors } from "@/lib/checkout-validation";

const timelineOptions = ["ASAP", "2–4 weeks", "1–2 months", "3+ months", "Flexible"];
const budgetOptions = ["₹2L–₹6L", "₹6L–₹20L", "₹20L+", "Not sure yet"];

/** Step 3 — project requirements. */
export function StepRequirements({
  requirements,
  onChange,
  errors,
}: {
  requirements: CheckoutRequirements;
  onChange: (patch: Partial<CheckoutRequirements>) => void;
  errors: RequirementsErrors;
}) {
  const set = <K extends keyof CheckoutRequirements>(key: K) => (value: CheckoutRequirements[K]) =>
    onChange({ [key]: value } as Partial<CheckoutRequirements>);

  return (
    <div className="space-y-6">
      <TextField
        label="Project name"
        value={requirements.projectName}
        onChange={set("projectName")}
        placeholder="e.g. Acme website redesign"
        required
        error={errors.projectName}
      />

      <TextAreaField
        label="Business description"
        value={requirements.businessDescription}
        onChange={set("businessDescription")}
        placeholder="What does your business do?"
        required
        rows={3}
        error={errors.businessDescription}
      />

      <TextAreaField
        label="Goals"
        value={requirements.goals}
        onChange={set("goals")}
        placeholder="What does success look like for this project?"
        required
        rows={3}
        error={errors.goals}
      />

      <TextField
        label="Target audience"
        value={requirements.targetAudience}
        onChange={set("targetAudience")}
        placeholder="Who is this for?"
        required
        error={errors.targetAudience}
      />

      <div>
        <span className="mb-3 block text-sm font-medium text-ink-soft">Timeline</span>
        <div className="flex flex-wrap gap-2">
          {timelineOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set("timeline")(option)}
              aria-pressed={requirements.timeline === option}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                requirements.timeline === option
                  ? "border-transparent bg-ink text-white"
                  : "border-line bg-surface text-ink-soft hover:border-ink/20"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        {errors.timeline && <p className="mt-1.5 text-xs text-red-600">{errors.timeline}</p>}
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-ink-soft">Budget</span>
        <div className="flex flex-wrap gap-2">
          {budgetOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => set("budget")(option)}
              aria-pressed={requirements.budget === option}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                requirements.budget === option
                  ? "border-transparent bg-ink text-white"
                  : "border-line bg-surface text-ink-soft hover:border-ink/20"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <TextAreaField
        label="Additional notes"
        value={requirements.additionalNotes}
        onChange={set("additionalNotes")}
        placeholder="Anything else we should know?"
        optional
        rows={3}
      />

      <FileUploadField files={requirements.files} onChange={(files) => set("files")(files)} />
    </div>
  );
}
