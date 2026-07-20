import { Hero } from "@/components/sections/Hero";
import { TrustBar } from "@/components/sections/TrustBar";
import { ServicesShowcase } from "@/components/sections/ServicesShowcase";
import { SpecialOffer } from "@/components/sections/SpecialOffer";
import { WhyCodeskate } from "@/components/sections/WhyCodeskate";
import { GrowthSection } from "@/components/sections/GrowthSection";
import { TechStack } from "@/components/sections/TechStack";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { FeaturedWork } from "@/components/sections/FeaturedWork";
import { CrmHighlight } from "@/components/sections/CrmHighlight";
import { ClientDashboardPreview } from "@/components/sections/ClientDashboardPreview";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ServicesShowcase />
      <SpecialOffer />
      <WhyCodeskate />
      <GrowthSection />
      <ProcessTimeline />
      <FeaturedWork />
      <CrmHighlight />
      <TechStack />
      <ClientDashboardPreview />
      <FAQ />
      <CTA />
    </>
  );
}
