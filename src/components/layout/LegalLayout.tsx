import type { ReactNode } from "react";
import { PageHeader } from "@/components/layout/PageHeader";

export type LegalSection = { heading: string; body: string[] };

/** Shared layout for Privacy / Terms pages. */
export function LegalLayout({
  eyebrow,
  title,
  updated,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={intro} />
      <section className="pb-24 md:pb-32">
        <div className="container-x">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm text-ink-faint">Last updated: {updated}</p>
            <div className="mt-10 space-y-12">
              {sections.map((section, i) => (
                <div key={section.heading}>
                  <h2 className="flex items-baseline gap-3 font-display text-xl tracking-tight text-ink">
                    <span className="text-sm tabular-nums text-ink-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </h2>
                  <div className="mt-4 space-y-4 pl-9">
                    {section.body.map((p, j) => (
                      <p key={j} className="text-sm leading-relaxed text-ink-muted">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
