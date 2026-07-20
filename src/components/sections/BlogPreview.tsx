import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { posts } from "@/lib/blog";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Journal / blog preview — three latest posts. */
export function BlogPreview() {
  return (
    <section className="py-24 md:py-32">
      <div className="container-x">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="The journal"
            title="Notes from the studio."
            description="Frameworks, teardowns and hard-won lessons on building digital products that grow."
          />
          <div className="hidden shrink-0 md:block">
            <Button href="/blog" variant="secondary" arrow magnetic>
              Read the journal
            </Button>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.08}>
              <Link href={`/blog/${post.slug}`} className="group block h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-4xl border border-line bg-surface shadow-soft transition-all duration-500 ease-premium group-hover:-translate-y-1.5 group-hover:shadow-lift">
                  <div className="relative aspect-[16/10] overflow-hidden">
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
                    <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ink">
                      Read more
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 md:hidden">
          <Button href="/blog" variant="secondary" arrow className="w-full">
            Read the journal
          </Button>
        </div>
      </div>
    </section>
  );
}
