"use client";

import { useSearchParams } from "next/navigation";
import { CheckoutFlow } from "@/features/payments";

/** Reads ?service=&package= from the URL and hands off to the checkout flow. */
export function CheckoutPageContent() {
  const params = useSearchParams();
  return (
    <CheckoutFlow
      initialServiceSlug={params.get("service")}
      initialPackageId={params.get("package")}
    />
  );
}
