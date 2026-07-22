import type { Metadata } from "next";
import { caseStudies } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Work — Case studies & outcomes",
  description:
    "Selected case studies from CodeSkate. See how we've helped fintech, SaaS, ecommerce and AI companies grow — with the numbers to prove it.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Selected work"
        title="Proof, measured in outcomes."
        description="We don't do work for the reel. Every engagement is judged by the business it moves — and here's the evidence."
      />

      <section className="relative overflow-hidden py-16 md:py-24">
        {/* soft ambient backdrop */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60% 50% at 15% 0%, rgba(79,70,229,0.06), transparent 70%), radial-gradient(50% 40% at 90% 20%, rgba(244,63,94,0.05), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="container-x">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Live from production</span>
              <h2 className="mt-2 font-display text-2xl tracking-tight text-ink md:text-3xl">
                Real client work, running right now.
              </h2>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink-soft shadow-soft">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              {caseStudies.length} live projects
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {caseStudies.map((study, i) => (
              <Reveal
                key={study.slug}
                delay={i * 0.08}
                className={i % 2 === 1 ? "md:mt-16" : ""}
              >
                <ProjectCard study={study} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
