"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { primaryNav, footerNav, site } from "@/lib/site";
import { services } from "@/lib/services";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

const EASE = [0.22, 1, 0.36, 1] as const;

type MenuKey = "services" | "resources";

const resourceLinks = footerNav.Resources;

/**
 * Navbar — dark glass chrome (Linear/Raycast style). Sticky; gains a stronger
 * blur + hairline after scroll. Hover pill follows the cursor across links.
 * Right side: "Log in" + a glowing "Start a project" CTA.
 */
export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<MenuKey | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close menus on route change (adjust during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300 ease-premium",
        scrolled
          ? "border-white/[0.08] bg-night/95 backdrop-blur-xl backdrop-saturate-150"
          : "border-transparent bg-night"
      )}
    >
      <div className="container-x">
        <nav
          className="flex h-16 items-center justify-between gap-4"
          onMouseLeave={() => {
            setOpenMenu(null);
            setHovered(null);
          }}
        >
          <div className="shrink-0">
            <Logo tone="dark" />
          </div>

          {/* Center nav */}
          <ul
            className="hidden flex-1 items-center justify-center gap-0.5 xl:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              return (
                <li
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => {
                    setHovered(item.href);
                    setOpenMenu(item.hasMega ? "services" : null);
                  }}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "relative isolate inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.85rem] transition-colors",
                      active ? "text-white" : "text-white/60 hover:text-white"
                    )}
                  >
                    {hovered === item.href && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    )}
                    {item.label}
                    {item.hasMega && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 opacity-60 transition-transform duration-300",
                          openMenu === "services" && "rotate-180"
                        )}
                      />
                    )}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-[17px] mx-auto h-px w-6 bg-royal shadow-[0_0_8px_rgba(255,106,26,0.9)]" />
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Resources dropdown */}
            <li
              className="relative"
              onMouseEnter={() => {
                setHovered("resources");
                setOpenMenu("resources");
              }}
            >
              <button
                className={cn(
                  "relative isolate inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.85rem] transition-colors",
                  openMenu === "resources" ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {hovered === "resources" && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-white/[0.07]"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
                Resources
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 opacity-60 transition-transform duration-300",
                    openMenu === "resources" && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {openMenu === "resources" && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: EASE }}
                    className="absolute right-0 top-full z-50 mt-3 w-64"
                  >
                    <div className="overflow-hidden rounded-2xl border border-white/10 bg-night-800/95 p-1.5 shadow-night-card backdrop-blur-xl">
                      {resourceLinks.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          className="group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white"
                        >
                          {r.label}
                          <ArrowRight className="h-3.5 w-3.5 text-white/30 transition-transform group-hover:translate-x-0.5 group-hover:text-royal" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* Right actions */}
          <div className="hidden shrink-0 items-center gap-1 xl:flex">
            <Button href="/login" variant="night-ghost" size="sm">
              Log in
            </Button>
            <Button href="/contact" variant="glow" size="sm" arrow>
              Start a project
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>

        {/* Services mega menu */}
        <AnimatePresence>
          {openMenu === "services" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="absolute inset-x-0 top-full hidden px-6 xl:block"
              onMouseEnter={() => setOpenMenu(openMenu)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <div className="container-x">
                <div className="mt-2 grid grid-cols-[1fr_17rem] gap-2 overflow-hidden rounded-3xl border border-white/10 bg-night-800/95 p-2 shadow-night-card backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-0.5">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="group flex items-start gap-3 rounded-2xl p-3.5 transition-colors hover:bg-white/[0.05]"
                      >
                        <span className="mt-0.5 font-mono text-[0.7rem] text-white/35 transition-colors group-hover:text-royal">
                          {s.index}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-white">
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-white/45">
                            {s.tagline}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/products/codeskate-crm"
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-night p-5"
                  >
                    <span className="night-glow absolute inset-0" aria-hidden />
                    <span className="relative">
                      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-royal-400">
                        Our product
                      </span>
                      <span className="mt-2 block text-base font-semibold text-white">
                        CodeSkate CRM
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-white/50">
                        The lead-management platform we built, run and ship every week.
                      </span>
                    </span>
                    <span className="relative mt-6 inline-flex items-center gap-1 text-xs font-medium text-white">
                      See it live
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 bg-night xl:hidden"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-4">
              <ul className="flex flex-col">
                {primaryNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 + i * 0.03 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center justify-between border-b border-white/[0.08] py-4 text-lg font-medium text-white"
                    >
                      {item.label}
                      <ArrowRight className="h-4 w-4 text-white/30" />
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-8">
                <p className="eyebrow mb-3">Services</p>
                <ul className="grid grid-cols-1 gap-0.5">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-3 rounded-lg py-2.5 text-sm text-white/65"
                      >
                        <span className="font-mono text-xs text-white/35">{s.index}</span>
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <Button href="/login" variant="night" size="lg">
                  Log in
                </Button>
                <Button href="/contact" variant="glow" size="lg">
                  Start a project
                </Button>
              </div>
              <a
                href={`mailto:${site.email}`}
                className="mt-6 block text-center font-mono text-xs text-white/40"
              >
                {site.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
