import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { stats } from "@/lib/content";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Company — The team behind the work",
  description:
    "CodeSkate is a remote-first product engineering studio. A senior team of engineers, designers and product strategists building software that scales.",
  alternates: { canonical: "/about" },
};

const values = [
  {
    title: "Outcomes over hours",
    detail:
      "We're accountable to your business results, not a timesheet. If it doesn't move a metric, we question why we're doing it.",
  },
  {
    title: "Senior people, real work",
    detail:
      "The people you meet are the people who do the work. No bait-and-switch to juniors after the contract is signed.",
  },
  {
    title: "Craft is non-negotiable",
    detail:
      "We sweat the details others skip — because that's the difference between forgettable and unforgettable.",
  },
  {
    title: "Honesty, even when it's hard",
    detail:
      "We'll tell you when an idea won't work, when a timeline is unrealistic, and when you don't need us at all.",
  },
  {
    title: "Partners, not vendors",
    detail:
      "We think like owners. Your goals become our goals, and we stay long after launch to see them through.",
  },
  {
    title: "Compound, don't churn",
    detail:
      "The best work builds on itself. We design systems and relationships meant to grow in value over years.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our company"
        title="A product engineering company, not an agency."
        description="CodeSkate is a remote-first product engineering studio working with teams worldwide. We keep the team senior on purpose — the people who scope your product are the people who build it."
      />

      {/* Manifesto */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-4xl">
            <Reveal>
              <p className="font-display text-2xl leading-[1.4] tracking-tight text-ink md:text-4xl md:leading-[1.35]">
                We started CodeSkate to close a gap: most teams could either
                <span className="text-gradient"> design an interface</span> or
                <span className="text-gradient"> ship a system</span> — rarely
                both, and rarely with software built to scale. We do the
                engineering and the product thinking together.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="border-y border-line bg-surface/50 py-16">
        <div className="container-x">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.08}>
                <div>
                  <div className="font-display text-4xl tracking-tight text-ink md:text-5xl">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-sm text-ink-muted">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 md:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we believe"
            title="Six principles we don't compromise on."
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <StaggerItem key={value.title}>
                <div className="h-full rounded-4xl border border-line bg-surface p-8 shadow-soft transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                  <span className="font-display text-sm tabular-nums text-ink-faint">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 font-display text-xl tracking-tight text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {value.detail}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTA />
    </>
  );
}
