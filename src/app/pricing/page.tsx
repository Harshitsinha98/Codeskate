import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { ServicePricingCard } from "@/components/sections/ServicePricingCard";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";
import { Reveal } from "@/components/motion/Reveal";
import { CATALOG_SERVICES } from "@/config/catalog";
import { OfferBanner } from "@/components/pricing/OfferBanner";

export const metadata: Metadata = {
  title: "Pricing — Transparent, per-service packages",
  description:
    "Clear, competitive pricing for every service — websites, apps, design, branding, marketing, ads, AI and maintenance. Fixed scope, milestone billing, no hourly games.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Investment"
        title="Transparent pricing for every service."
        description="Every service starts at a clear price — the final quote depends on your scope, so tap Enquire Now and we'll confirm it on WhatsApp within minutes."
      />

      {/* Launch offer lives here (moved off the homepage + announcement bar). */}
      <OfferBanner />

      <section className="py-16 md:py-20">
        <div className="container-x">
          <div className="grid gap-6 lg:grid-cols-2">
            {CATALOG_SERVICES.map((service, i) => (
              <ServicePricingCard key={service.slug} service={service} index={i} />
            ))}
          </div>

          <Reveal>
            <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-ink-muted">
              All prices in INR and mark the starting point of each engagement.
              International projects quoted in USD/EUR. Payment in milestones —
              never everything up front.
            </p>
          </Reveal>
        </div>
      </section>

      <FAQ />
      <CTA />
    </>
  );
}
