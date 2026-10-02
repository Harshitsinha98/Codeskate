import { HeroNight } from "@/components/home/HeroNight";
import { ProofStrip } from "@/components/home/ProofStrip";
import { ServicesBento } from "@/components/home/ServicesBento";
import { WorkShowcase } from "@/components/home/WorkShowcase";
import { ProductSection } from "@/components/home/ProductSection";
import { ProcessStepper } from "@/components/home/ProcessStepper";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

/**
 * Homepage — 8 sections, dark/light rhythm:
 * Hero (dark) → Proof (dark) → Services bento (dark) → Work (light)
 * → Product (dark) → Process (light) → FAQ (light) → CTA (dark).
 */
export default function HomePage() {
  return (
    <>
      <HeroNight />
      <ProofStrip />
      <ServicesBento />
      <WorkShowcase />
      <ProductSection />
      <ProcessStepper />
      <FAQ />
      <CTA />
    </>
  );
}
