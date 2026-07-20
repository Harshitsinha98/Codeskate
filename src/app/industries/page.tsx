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
        title="We've seen your problem before."
        description="Nine years and 150+ engagements across the sectors that move fastest. That pattern recognition means you skip the expensive mistakes and get to what works, sooner."
      />
      <Industries />
      <CTA />
    </>
  );
}
