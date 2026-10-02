import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { Check, X } from "lucide-react";
import { stats } from "@/lib/content";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Company — The team behind the work",
  description:
    "CodeSkate is a remote-first product engineering studio. A senior team of engineers, designers and product strategists building software that scales.",
  alternates: { canonical: "/about" },
};

const comparison = [
  { topic: "Who builds it", agency: "Juniors, after the sales call", us: "The senior team you met" },
  { topic: "Pricing", agency: "Hourly, open-ended", us: "Fixed price, paid per milestone" },
  { topic: "Visibility", agency: "Status emails when you chase", us: "Live client portal + weekly preview" },
  { topic: "Ownership", agency: "Locked into their stack", us: "100% of the code is yours" },
  { topic: "After launch", agency: "New contract for every fix", us: "Monitoring, fixes and a roadmap" },
];

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
              <span className="eyebrow">Why we exist</span>
              <p className="mt-6 text-2xl font-medium leading-[1.4] tracking-tight text-ink md:text-4xl md:leading-[1.3]">
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
      <section className="section-night border-y border-white/[0.06]">
        <div className="container-x grid grid-cols-2 md:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.06}>
              <div
                className={`px-2 py-12 text-center ${i % 2 === 1 ? "border-l border-white/[0.06]" : ""} ${
                  i === 2 ? "md:border-l md:border-white/[0.06]" : ""
                } ${i >= 2 ? "border-t border-white/[0.06] md:border-t-0" : ""}`}
              >
                <div className="font-mono text-4xl font-medium tabular-nums tracking-tight text-white md:text-5xl">
                  {stat.value}
                </div>
                <div className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/40">
                  {stat.label}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Agency vs CodeSkate */}
      <section className="bg-base py-24 md:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="The difference"
            title="What working with us actually changes."
          />
          <Reveal delay={0.1}>
            <div className="mt-12 overflow-hidden rounded-3xl border border-line">
              <div className="grid grid-cols-[1fr_1fr] border-b border-line bg-subtle font-mono text-[0.68rem] uppercase tracking-[0.14em] text-ink-muted md:grid-cols-[0.8fr_1fr_1fr]">
                <span className="hidden px-6 py-4 md:block" />
                <span className="px-6 py-4">Typical agency</span>
                <span className="border-l border-line bg-night px-6 py-4 text-royal-400">CodeSkate</span>
              </div>
              {comparison.map((row) => (
                <div
                  key={row.topic}
                  className="grid grid-cols-[1fr_1fr] border-b border-line last:border-0 md:grid-cols-[0.8fr_1fr_1fr]"
                >
                  <span className="col-span-2 px-6 pt-5 text-sm font-semibold text-ink md:col-span-1 md:py-5">
                    {row.topic}
                  </span>
                  <span className="flex items-start gap-2 px-6 py-4 text-sm text-ink-muted md:py-5">
                    <X className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" />
                    {row.agency}
                  </span>
                  <span className="flex items-start gap-2 border-l border-white/[0.06] bg-night px-6 py-4 text-sm text-white/85 md:py-5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-royal-400" />
                    {row.us}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-line bg-subtle py-24 md:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="What we believe"
            title="Six principles we don't compromise on."
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {values.map((value, i) => (
              <StaggerItem key={value.title}>
                <Spotlight className="h-full rounded-3xl border border-line bg-surface p-8 transition-colors duration-300 hover:border-ink/15">
                  <span className="font-mono text-xs tabular-nums text-royal">
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {value.detail}
                  </p>
                </Spotlight>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTA />
    </>
  );
}
