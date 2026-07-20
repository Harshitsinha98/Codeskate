import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Careers — Do the best work of your life",
  description:
    "Join CodeSkate — a remote-first product engineering studio. Senior team, high standards, real ownership. See open roles.",
  alternates: { canonical: "/careers" },
};

const roles = [
  { title: "Senior Product Designer", type: "Full-time", location: "Remote", team: "Design" },
  { title: "Principal Frontend Engineer", type: "Full-time", location: "Remote", team: "Engineering" },
  { title: "Motion Designer", type: "Contract", location: "Remote", team: "Design" },
  { title: "Growth Marketer", type: "Full-time", location: "Remote", team: "Growth" },
];

const perks = [
  { title: "Senior-only team", detail: "No hierarchy to hide behind. Everyone here is trusted to own their craft." },
  { title: "Real ownership", detail: "You'll ship work with your name on it, for clients who care about quality." },
  { title: "Remote-friendly", detail: "Work where you do your best thinking. We optimize for output, not attendance." },
  { title: "Learning budget", detail: "An annual budget for courses, conferences and tools that make you sharper." },
  { title: "Four-day focus", detail: "Fridays are for deep work — no meetings, no Slack fire-drills." },
  { title: "Profit share", detail: "When the studio wins, everyone who built it wins too." },
];

export default function CareersPage() {
  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Do the best work of your life."
        description="We keep the team small and the bar high. If you're a senior craftsperson who's tired of watering down your work to fit a process, we should talk."
      />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading eyebrow="Open roles" title="Where we need you." />
          <Stagger className="mt-12 divide-y divide-line border-y border-line">
            {roles.map((role) => (
              <StaggerItem key={role.title}>
                <Link
                  href={`mailto:${site.email}?subject=Application: ${role.title}`}
                  className="group flex flex-col gap-3 py-6 transition-all duration-500 hover:px-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-display text-2xl tracking-tight text-ink">
                      {role.title}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span className="rounded-full bg-ink/5 px-3 py-1">{role.team}</span>
                      <span className="rounded-full bg-ink/5 px-3 py-1">{role.type}</span>
                      <span className="rounded-full bg-ink/5 px-3 py-1">{role.location}</span>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-ink">
                    Apply
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
          <Reveal>
            <p className="mt-8 text-sm text-ink-muted">
              Don&apos;t see your role?{" "}
              <a
                href={`mailto:${site.email}?subject=Open application`}
                className="font-medium text-ink underline-offset-4 hover:underline"
              >
                Send us an open application →
              </a>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-surface/40 py-24 md:py-32">
        <div className="container-x">
          <SectionHeading
            eyebrow="Why CodeSkate"
            title="Built for people who care."
          />
          <Stagger className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((perk) => (
              <StaggerItem key={perk.title}>
                <div className="h-full rounded-4xl border border-line bg-surface p-8 shadow-soft">
                  <h3 className="font-display text-xl tracking-tight text-ink">
                    {perk.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                    {perk.detail}
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
