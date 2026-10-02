import type { Metadata } from "next";
import { caseStudies } from "@/lib/content";
import { caseMeta } from "@/lib/home";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { WorkCard } from "@/components/home/WorkShowcase";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Work — Case studies & outcomes",
  description:
    "Selected case studies from CodeSkate — live client products across finance, community and ecommerce, with the stack and outcomes behind each.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const [lead, ...rest] = caseStudies;
  const industries = new Set(caseStudies.map((c) => caseMeta[c.slug]?.industry).filter(Boolean));
  const stacks = new Set(caseStudies.flatMap((c) => caseMeta[c.slug]?.tech ?? []));

  const summary = [
    { value: caseStudies.length, label: "Live client products" },
    { value: industries.size, label: "Industries" },
    { value: stacks.size, label: "Technologies shipped" },
    { value: "100%", label: "Code ownership" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Proof, running in production."
        description="No mockups for the reel. Every project here is live, used by real customers, and built on code the client fully owns."
      >
        <div className="grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-4">
          {summary.map((s) => (
            <div key={s.label} className="bg-night px-5 py-4">
              <p className="font-mono text-2xl tabular-nums text-white">{s.value}</p>
              <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.14em] text-white/40">{s.label}</p>
            </div>
          ))}
        </div>
      </PageHeader>

      <section className="bg-base py-16 md:py-24">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {lead && (
              <Reveal className="lg:col-span-2">
                <WorkCard slug={lead.slug} large />
              </Reveal>
            )}
            {rest.map((s, i) => (
              <Reveal key={s.slug} delay={(i % 2) * 0.08}>
                <WorkCard slug={s.slug} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
