"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { footerNav, site } from "@/lib/site";
import { Logo } from "@/components/ui/Logo";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

type Health = "checking" | "ok" | "degraded";

/** Live status dot backed by the real /api/health liveness probe. */
function StatusDot() {
  const [health, setHealth] = useState<Health>("checking");

  useEffect(() => {
    let alive = true;
    fetch("/api/health", { cache: "no-store" })
      .then((r) => alive && setHealth(r.ok ? "ok" : "degraded"))
      .catch(() => alive && setHealth("degraded"));
    return () => {
      alive = false;
    };
  }, []);

  const tone =
    health === "ok"
      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
      : health === "degraded"
        ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]"
        : "bg-white/30";
  const label =
    health === "ok"
      ? "All systems operational"
      : health === "degraded"
        ? "Partial service disruption"
        : "Checking status…";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[0.7rem] text-white/60">
      <span className={`h-1.5 w-1.5 rounded-full ${tone}`} />
      {label}
    </span>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-night text-white">
      <div className="container-x relative">
        <div className="grid grid-cols-2 gap-10 py-16 md:grid-cols-12">
          <div className="col-span-2 md:col-span-4">
            <Logo tone="dark" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/50">
              Product engineering studio. We design, build and ship software —
              and run our own product, CodeSkate CRM.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </div>

          {Object.entries(footerNav).map(([group, links]) => (
            <div key={group} className="md:col-span-2">
              <h3 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/35">
                {group}
              </h3>
              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-2">
            <h3 className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white/35">
              Connect
            </h3>
            <ul className="mt-5 space-y-3">
              {site.socials.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                  >
                    {s.label}
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-4 border-t border-white/[0.08] py-6 text-xs text-white/40 md:flex-row md:items-center">
          <div className="flex flex-wrap items-center gap-4">
            <StatusDot />
            <p>
              © {year} {site.legalName}. Built in India.
            </p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden className="pointer-events-none relative -mb-[0.22em] select-none text-center">
        <span className="block bg-gradient-to-b from-white/[0.09] to-transparent bg-clip-text text-[19vw] font-semibold leading-none tracking-[-0.06em] text-transparent">
          codeskate
        </span>
      </div>
    </footer>
  );
}
