import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { primaryNav } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="noise relative flex min-h-[80vh] items-center overflow-hidden mesh-hero">
      <div className="container-x relative text-center">
        <p className="eyebrow justify-center text-ink-muted">Error 404</p>
        <h1 className="mt-6 font-display text-[clamp(4rem,18vw,12rem)] leading-none tracking-tight text-gradient">
          404
        </h1>
        <h2 className="mt-4 font-display text-2xl tracking-tight text-ink md:text-3xl">
          This page took a different path.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
          get you back to something worth seeing.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/" variant="primary" size="lg" arrow magnetic>
            Back to home
          </Button>
          <Button href="/contact" variant="secondary" size="lg" magnetic>
            Get in touch
          </Button>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-muted">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
