import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { posts, getPost } from "@/lib/blog";
import { postBodies } from "@/lib/blog-content";
import { PageHeader } from "@/components/layout/PageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { CTA } from "@/components/sections/CTA";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const idx = posts.findIndex((p) => p.slug === slug);
  const next = posts[(idx + 1) % posts.length];
  const body = postBodies[slug];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Person", name: post.author },
    publisher: { "@type": "Organization", name: site.legalName },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <PageHeader eyebrow={post.category} title={post.title}>
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Journal
          </Link>
          <span className="h-4 w-px bg-line" />
          <span>By {post.author}</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>{post.date}</span>
          <span className="h-1 w-1 rounded-full bg-ink-faint" />
          <span>{post.readTime} read</span>
        </div>
      </PageHeader>

      {/* Cover */}
      <section className="pb-12">
        <div className="container-x">
          <Reveal>
            <div className="relative aspect-[16/7] overflow-hidden rounded-[2rem] border border-line shadow-lift">
              <div className={cn("absolute inset-0 bg-gradient-to-br", post.cover)} />
              <div className="noise absolute inset-0 opacity-40" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Body */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <article
              className={cn(
                "mx-auto max-w-2xl",
                "prose-article space-y-6 text-lg leading-relaxed text-ink-soft",
                "[&>h2]:mt-12 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:tracking-tight [&>h2]:text-ink",
                "[&>blockquote]:border-l-2 [&>blockquote]:border-royal [&>blockquote]:pl-6 [&>blockquote]:font-display [&>blockquote]:text-xl [&>blockquote]:italic [&>blockquote]:text-ink",
                "[&_em]:italic"
              )}
            >
              {body}
            </article>
          </Reveal>
        </div>
      </section>

      {/* Next post */}
      <section className="pb-24">
        <div className="container-x">
          <Reveal>
            <Link
              href={`/blog/${next.slug}`}
              className="group mx-auto flex max-w-2xl flex-col items-start justify-between gap-4 rounded-4xl border border-line bg-surface p-8 shadow-soft transition-all duration-500 hover:shadow-lift md:flex-row md:items-center"
            >
              <div>
                <span className="eyebrow">Next up</span>
                <p className="mt-2 font-display text-xl tracking-tight text-ink">
                  {next.title}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
                Read
                <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
              </span>
            </Link>
          </Reveal>
        </div>
      </section>

      <CTA />
    </>
  );
}
