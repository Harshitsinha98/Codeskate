import type { Metadata } from "next";
import { caseStudies } from "@/lib/content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { LiveCaseStudies } from "@/components/sections/LiveCaseStudies";
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

      <section className="py-16 md:py-24">
        <div className="container-x">
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

      <LiveCaseStudies />

      <CTA />
    </>
  );
}
