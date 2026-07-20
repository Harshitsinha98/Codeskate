"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footerNav, site } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

export function Footer() {
  const year = 2026;

  return (
    <footer className="border-t border-line bg-base">
      <div className="container-x">
        {/* Link grid */}
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
              {site.description}
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>

          {Object.entries(footerNav).map(([group, links]) => (
            <div key={group} className="md:col-span-2">
              <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
                {group}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">
              Connect
            </h3>
            <ul className="mt-5 space-y-3">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-start justify-between gap-4 border-t border-line py-8 text-xs text-ink-muted md:flex-row md:items-center">
          <p>
            © {year} {site.legalName}. {site.tagline} Built in Bengaluru.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="transition-colors hover:text-ink"
            >
              {site.email}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
