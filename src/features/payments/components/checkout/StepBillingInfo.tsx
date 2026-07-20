"use client";

import type { CheckoutBillingInfo } from "@/types/checkout";
import type { BillingErrors } from "@/lib/checkout-validation";
import { FieldGrid, TextField } from "@/features/payments/components/checkout/fields";

export type { BillingErrors } from "@/lib/checkout-validation";

/** Step 2 — billing information. */
export function StepBillingInfo({
  billing,
  onChange,
  errors,
}: {
  billing: CheckoutBillingInfo;
  onChange: (patch: Partial<CheckoutBillingInfo>) => void;
  errors: BillingErrors;
}) {
  const set = <K extends keyof CheckoutBillingInfo>(key: K) => (value: string) =>
    onChange({ [key]: value } as Partial<CheckoutBillingInfo>);

  return (
    <div className="space-y-6">
      <FieldGrid>
        <TextField
          label="Full name"
          value={billing.name}
          onChange={set("name")}
          placeholder="Jane Cooper"
          required
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          label="Work email"
          type="email"
          value={billing.email}
          onChange={set("email")}
          placeholder="jane@company.com"
          required
          autoComplete="email"
          error={errors.email}
        />
      </FieldGrid>

      <FieldGrid>
        <TextField
          label="Phone"
          type="tel"
          value={billing.phone}
          onChange={set("phone")}
          placeholder="+91 98765 43210"
          required
          autoComplete="tel"
          error={errors.phone}
        />
        <TextField
          label="Company"
          value={billing.company}
          onChange={set("company")}
          placeholder="Acme Inc."
          required
          autoComplete="organization"
          error={errors.company}
        />
      </FieldGrid>

      <TextField
        label="GST number"
        value={billing.gstNumber}
        onChange={set("gstNumber")}
        placeholder="22AAAAA0000A1Z5"
        optional
        error={errors.gstNumber}
      />

      <FieldGrid>
        <TextField
          label="Country"
          value={billing.country}
          onChange={set("country")}
          placeholder="India"
          required
          autoComplete="country-name"
          error={errors.country}
        />
        <TextField
          label="State"
          value={billing.state}
          onChange={set("state")}
          placeholder="Karnataka"
          required
          autoComplete="address-level1"
          error={errors.state}
        />
      </FieldGrid>

      <FieldGrid>
        <TextField
          label="City"
          value={billing.city}
          onChange={set("city")}
          placeholder="Bengaluru"
          required
          autoComplete="address-level2"
          error={errors.city}
        />
        <TextField
          label="Address"
          value={billing.address}
          onChange={set("address")}
          placeholder="Street, building, floor"
          required
          autoComplete="street-address"
          error={errors.address}
        />
      </FieldGrid>
    </div>
  );
}
