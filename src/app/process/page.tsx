import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Process — From idea to compounding growth",
  description:
    "A transparent, six-phase process that de-risks ambition: discover, strategy, design, build, launch and grow. Here's exactly how CodeSkate works.",
  alternates: { canonical: "/process" },
};

const principles = [
  {
    title: "You see progress daily",
    detail:
      "Every branch ships to a live preview. No waiting weeks for a big reveal — you watch it come together.",
  },
  {
    title: "Fixed scope, no surprises",
    detail:
      "We agree what we're building and what it costs before we start. Change is welcome, but never a surprise on the invoice.",
  },
  {
    title: "Decisions are documented",
    detail:
      "Why we chose what we chose — written down, so the rationale outlives any single conversation.",
  },
  {
    title: "Launch is rehearsed",
    detail:
      "We dry-run the go-live so the real one is calm. Analytics, tracking and SEO are in place before you're public.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="How we work"
        title="A process built to de-risk ambition."
        description="Great work is rarely an accident. Ours comes from a deliberate, transparent process — refined over 150+ engagements — that turns big goals into shipped, measurable outcomes."
      />

      <ProcessTimeline />

      <section className="bg-surface/40 py-24 md:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="Working with us"
            title="What it actually feels like."
            description="The process on paper is one thing. Here's what clients tell us the experience is really like."
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
            {principles.map((p, i) => (
              <StaggerItem key={p.title}>
                <div className="flex h-full gap-5 rounded-4xl border border-line bg-surface p-8 shadow-soft">
                  <span className="font-display text-2xl tabular-nums text-ink-faint">
                    0{i + 1}
                  </span>
                  <div>
                    <h3 className="font-display text-xl tracking-tight text-ink">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {p.detail}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal>
            <p className="mt-12 text-center text-sm text-ink-muted">
              Curious how this maps to your project?{" "}
              <a href="/contact" className="font-medium text-ink underline-offset-4 hover:underline">
                Book a discovery call →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
