import { caseStudies } from "@/lib/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ProjectCard } from "@/components/sections/ProjectCard";
import { Button } from "@/components/ui/Button";

/** Featured case studies — offset two-column layout. */
export function FeaturedWork() {
  const featured = caseStudies.slice(0, 4);

  return (
    <section className="border-b border-line bg-base py-20 md:py-28">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="Portfolio"
            title="Real products. Measurable results."
            description="A few products we've shipped — and the business impact that followed. Every project is measured by the outcomes it drives."
          />
          <div className="hidden shrink-0 md:block">
            <Button href="/work" variant="secondary" arrow>
              View all case studies
            </Button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
          {featured.map((study, i) => (
            <Reveal key={study.slug} delay={(i % 2) * 0.08}>
              <ProjectCard study={study} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 md:hidden">
          <Button href="/work" variant="secondary" arrow className="w-full">
            View all case studies
          </Button>
        </div>
      </div>
    </section>
  );
}
