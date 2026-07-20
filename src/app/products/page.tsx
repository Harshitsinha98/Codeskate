import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, PhoneCall, MessageCircle, Timer, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";

export const metadata: Metadata = {
  title: "Products — Software we built and run ourselves",
  description:
    "We don't just build for clients — we ship and run our own products. CodeSkate CRM and BreakIQ are live in production and used every day.",
  alternates: { canonical: "/products" },
};

type Product = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  url: string;
  tags: string[];
  highlights: { icon: typeof PhoneCall; label: string }[];
};

const PRODUCTS: Product[] = [
  {
    slug: "codeskate-crm",
    name: "CodeSkate CRM",
    tagline: "Lead management with a native call tracker",
    description:
      "A multi-tenant lead-management platform with a native Android call tracker, WhatsApp automation, employee management and billing. Purpose-built for teams that live on the phone.",
    url: "https://crm.codeskate.com",
    tags: ["SaaS", "CRM", "Android"],
    highlights: [
      { icon: PhoneCall, label: "Native call tracker" },
      { icon: MessageCircle, label: "WhatsApp automation" },
    ],
  },
  {
    slug: "breakiq",
    name: "BreakIQ",
    tagline: "Break & workforce management, built in-house",
    description:
      "An internal tool we built to fix break and workforce management in our own office — real-time tracking, policy enforcement and threshold alerts. Live and in daily use.",
    url: "https://breakiq.in",
    tags: ["Operations", "Real-time", "Internal"],
    highlights: [
      { icon: Timer, label: "Real-time tracking" },
      { icon: ShieldCheck, label: "Policy enforcement" },
    ],
  },
];

const shotUrl = (url: string) =>
  `https://s.wordpress.com/mshots/v1/${encodeURIComponent(url)}?w=1200&h=750`;

export default function ProductsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Our products"
        title="We ship our own software, not just clients'."
        description="The best proof that we can build your product is that we build and run our own. These are live, in production, and used every day."
      />

      <section className="py-20 md:py-28">
        <div className="container-x">
          <SectionHeading
            eyebrow="Built by CodeSkate"
            title="Two products, both live in production."
            align="center"
            className="mb-14"
          />
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-soft transition-shadow duration-300 hover:shadow-lift">
                  <Link href={`/products/${p.slug}`} className="block">
                    <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-line bg-subtle">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={shotUrl(p.url)}
                        alt={`${p.name} — live product`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  </Link>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap gap-2">
                      {p.tags.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full border border-line bg-subtle px-2.5 py-1 text-[0.65rem] font-semibold text-ink-muted"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-4 font-display text-2xl tracking-tight text-ink">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-royal">
                      {p.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft">
                      {p.description}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-4">
                      {p.highlights.map((h) => (
                        <span
                          key={h.label}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft"
                        >
                          <h.icon className="h-4 w-4 text-royal" />
                          {h.label}
                        </span>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-5 border-t border-line pt-5">
                      <Link
                        href={`/products/${p.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink transition-colors hover:text-royal"
                      >
                        Learn more
                        <ArrowUpRight className="h-4 w-4" />
                      </Link>
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-royal transition-colors hover:text-royal-600"
                      >
                        Visit live site
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
