import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Industries } from "@/components/sections/Industries";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Industries — Depth where it counts",
  description:
    "CodeSkate brings pattern recognition across fintech, healthcare, SaaS, ecommerce, real estate, education, hospitality and enterprise.",
  alternates: { canonical: "/industries" },
};

export default function IndustriesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Industries"
        title="We build for the sectors that move fastest."
        description="From fintech to ecommerce, we bring product thinking and engineering depth to every domain — so you skip the expensive mistakes and get to what works, sooner."
      />
      <Industries />
      <CTA />
    </>
  );
}
