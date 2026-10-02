import type { Metadata } from "next";
import {
  PhoneCall,
  MessageCircle,
  Users,
  LayoutDashboard,
  Building2,
  Receipt,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";
import { waLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "CodeSkate CRM — Lead management with a native call tracker",
  description:
    "CodeSkate CRM is a multi-tenant lead-management platform with a native Android call tracker, WhatsApp automation, employee management and billing. Capture every lead, never miss a follow-up.",
  alternates: { canonical: "/products/codeskate-crm" },
};

const DEMO_URL = "https://crm.codeskate.com";

const enquire = waLink(
  "Hi CodeSkate, I'm interested in CodeSkate CRM for lead management. Can you share pricing and a demo?"
);

const FEATURES = [
  {
    icon: PhoneCall,
    title: "Native call tracker",
    body: "An Android app logs every incoming and outgoing call automatically and ties it to the right lead — no manual entry, no missed follow-ups.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp automation",
    body: "Reach leads on the channel they actually reply to. Send updates and follow-ups straight from the lead record.",
  },
  {
    icon: LayoutDashboard,
    title: "Lead Hub",
    body: "Every lead in one pipeline — list, detail and next-action views so your team always knows who to call next.",
  },
  {
    icon: Users,
    title: "Employee management",
    body: "Assign leads, track activity and measure performance across your whole sales team with role-based access.",
  },
  {
    icon: Building2,
    title: "Multi-tenant",
    body: "Built to run multiple businesses or branches from one platform — each with isolated data and its own team.",
  },
  {
    icon: Receipt,
    title: "Billing & tasks",
    body: "Invoicing and task tracking baked in, so lead-to-payment lives in a single system your team already uses.",
  },
];

const OUTCOMES = [
  "Capture every call automatically",
  "Never lose a lead to a missed follow-up",
  "See exactly what your team is doing",
  "Run it on web and Android",
];

export default function CodeSkateCrmPage() {
  return (
    <>
      <PageHeader
        eyebrow="Product · CodeSkate CRM"
        title="Capture every lead. Miss zero follow-ups."
        description="CodeSkate CRM is a lead-management platform with a native call tracker and WhatsApp automation — purpose-built for teams that live on the phone."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button href={enquire} variant="glow" size="lg" external>
            Enquire on WhatsApp
          </Button>
          <Button href={DEMO_URL} variant="night" size="lg" external>
            Open live demo
          </Button>
        </div>
      </PageHeader>

      {/* Outcomes strip */}
      <section className="border-y border-line bg-surface/50 py-10">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OUTCOMES.map((o, i) => (
              <Reveal key={o} delay={i * 0.06}>
                <div className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-sm text-ink-soft">{o}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="What's inside"
            title="Everything a sales team needs — in one place."
            align="center"
            className="mb-14"
          />
          <Stagger className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="flex h-full flex-col rounded-3xl border border-line bg-surface p-6 shadow-soft">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-royal/10 text-royal">
                    <f.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 font-display text-lg tracking-tight text-ink">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Live demo */}
      <section className="border-t border-line bg-base py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="See it live"
            title="Try the real product."
            description="This is the actual CodeSkate CRM running in production. Explore it below, or open it full-screen in a new tab."
            align="center"
            className="mb-12"
          />
          <Reveal>
            <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-lift">
              <div className="flex items-center gap-2 border-b border-line bg-subtle px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-danger/60" />
                <span className="h-3 w-3 rounded-full bg-royal/60" />
                <span className="h-3 w-3 rounded-full bg-success/60" />
                <span className="ml-3 truncate text-xs text-ink-faint">
                  {DEMO_URL.replace(/^https?:\/\//, "")}
                </span>
                <a
                  href={DEMO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-royal transition-colors hover:text-royal-600"
                >
                  Open live
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open CodeSkate CRM live"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://s.wordpress.com/mshots/v1/${encodeURIComponent(
                    DEMO_URL
                  )}?w=1400&h=875`}
                  alt="CodeSkate CRM live product preview"
                  loading="lazy"
                  className="w-full object-cover object-top"
                />
              </a>
            </div>
          </Reveal>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href={enquire} variant="primary" size="lg" external>
              Enquire on WhatsApp
            </Button>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
            >
              Open demo full-screen
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
