import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/blog";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Journal — Notes from the team",
  description:
    "Frameworks, teardowns and hard-won lessons on building software that scales, from the CodeSkate team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [featured, ...rest] = posts;

  return (
    <>
      <PageHeader
        eyebrow="The journal"
        title="Notes from the studio."
        description="No thought-leadership fluff. Just the frameworks, teardowns and lessons we've earned building digital products that grow."
      />

      <section className="py-16 md:py-24">
        <div className="container-x">
          {/* Featured */}
          <Reveal>
            <Link href={`/blog/${featured.slug}`} className="group block">
              <article className="grid grid-cols-1 overflow-hidden rounded-[2rem] border border-line bg-surface shadow-soft transition-all duration-500 hover:shadow-lift lg:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto">
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
                      featured.cover
                    )}
                  />
                  <div className="noise absolute inset-0 opacity-40" />
                  <span className="absolute left-6 top-6 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
                    Featured · {featured.category}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <div className="flex items-center gap-2 text-xs text-ink-faint">
                    <span>{featured.date}</span>
                    <span className="h-1 w-1 rounded-full bg-ink-faint" />
                    <span>{featured.readTime} read</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-ink md:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-ink-muted">
                    {featured.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-ink">
                    Read article
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </article>
            </Link>
          </Reveal>

          {/* Rest */}
          <Stagger className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {rest.map((post) => (
              <StaggerItem key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-surface shadow-soft transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-lift">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <div
                        className={cn(
                          "absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
                          post.cover
                        )}
                      />
                      <div className="noise absolute inset-0 opacity-40" />
                      <span className="absolute left-5 top-5 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-ink backdrop-blur">
                        {post.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 text-xs text-ink-faint">
                        <span>{post.date}</span>
                        <span className="h-1 w-1 rounded-full bg-ink-faint" />
                        <span>{post.readTime} read</span>
                      </div>
                      <h3 className="mt-3 font-display text-xl leading-snug tracking-tight text-ink">
                        {post.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
                        {post.excerpt}
                      </p>
                    </div>
                  </article>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <CTA />
    </>
  );
}
