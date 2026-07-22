"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X, ArrowRight, Phone, Zap } from "lucide-react";
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
 * PHASE 2 — Navbar.
 * Sticky, transparent at top → white glass blur after scroll. Centered nav
 * with an animated shared underline, a Services mega menu, a Resources
 * dropdown, and Login / Book Consultation / Start Project actions.
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
        "sticky top-0 z-50 w-full transition-all duration-300 ease-premium",
        scrolled
          ? "border-b border-line bg-white/80 shadow-soft backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
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
          {/* Left: logo */}
          <div className="shrink-0">
            <Logo />
          </div>

          {/* Center: nav */}
          <ul
            className="hidden flex-1 items-center justify-center gap-0.5 xl:flex"
            onMouseLeave={() => setHovered(null)}
          >
            {primaryNav.map((item) => {
              const active = isActive(item.href);
              const hasDropdown = item.hasMega;
              const key = hovered === item.href;
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
                      "relative inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                      active ? "text-ink" : "text-ink-soft hover:text-ink"
                    )}
                  >
                    {item.label}
                    {hasDropdown && (
                      <ChevronDown
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-300",
                          openMenu === "services" && "rotate-180"
                        )}
                      />
                    )}
                    {/* animated shared underline */}
                    {(key || active) && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-royal"
                        transition={{ duration: 0.3, ease: EASE }}
                      />
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
                  "relative inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  openMenu === "resources"
                    ? "text-ink"
                    : "text-ink-soft hover:text-ink"
                )}
              >
                Resources
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-300",
                    openMenu === "resources" && "rotate-180"
                  )}
                />
                {hovered === "resources" && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-royal"
                    transition={{ duration: 0.3, ease: EASE }}
                  />
                )}
              </button>

              {/* Resources panel — anchored under the button */}
              <AnimatePresence>
                {openMenu === "resources" && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.22, ease: EASE }}
                    className="absolute right-0 top-full z-50 mt-2 w-72"
                  >
                    <div className="overflow-hidden rounded-3xl border border-line bg-white/95 p-2 shadow-lift backdrop-blur-xl">
                      {resourceLinks.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          className="group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium text-ink-soft transition-colors hover:bg-subtle hover:text-ink"
                        >
                          {r.label}
                          <ArrowRight className="h-4 w-4 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-royal" />
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </ul>

          {/* Right: actions */}
          <div className="hidden shrink-0 items-center gap-1.5 xl:flex">
            <Button
              href={`tel:${site.phone.replace(/\s/g, "")}`}
              external
              variant="secondary"
              size="md"
            >
              <span className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Call Now
              </span>
            </Button>
            <Button href="https://crm.codeskate.com" external variant="primary" size="md">
              <span className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4 fill-current" />
                Try CodeSkate CRM
              </span>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface text-ink xl:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Services mega menu */}
        <AnimatePresence>
          {openMenu === "services" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="absolute inset-x-0 top-full hidden px-6 xl:block"
              onMouseEnter={() => setOpenMenu(openMenu)}
            >
              <div className="container-x">
                <div className="mt-2 overflow-hidden rounded-3xl border border-line bg-white/95 p-3 shadow-lift backdrop-blur-xl">
                  <div className="grid grid-cols-2 gap-1">
                    {services.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/services/${s.slug}`}
                        className="group flex items-start gap-3 rounded-2xl p-3.5 transition-colors hover:bg-subtle"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-line bg-subtle text-xs font-bold tabular-nums text-royal transition-colors group-hover:border-royal group-hover:bg-royal group-hover:text-white">
                          {s.index}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold text-ink">
                            {s.title}
                          </span>
                          <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">
                            {s.tagline}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="m-1 mt-2 flex items-center justify-between rounded-2xl bg-subtle px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        Not sure what you need?
                      </p>
                      <p className="text-xs text-ink-muted">
                        Book a free consultation and we&apos;ll map it out with you.
                      </p>
                    </div>
                    <Button href="/contact" variant="primary" size="md" arrow>
                      Book Consultation
                    </Button>
                  </div>
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
            className="fixed inset-0 top-0 z-40 bg-base xl:hidden"
          >
            <div className="flex h-full flex-col overflow-y-auto px-6 pb-10 pt-24">
              <ul className="flex flex-col">
                {primaryNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 + i * 0.04 }}
                  >
                    <Link
                      href={item.href}
                      className="block border-b border-line py-4 text-xl font-semibold text-ink"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-6">
                <p className="eyebrow mb-3">Services</p>
                <ul className="grid grid-cols-1 gap-1">
                  {services.map((s) => (
                    <li key={s.slug}>
                      <Link
                        href={`/services/${s.slug}`}
                        className="flex items-center gap-3 rounded-lg py-2.5 text-sm text-ink-soft"
                      >
                        <span className="text-xs font-semibold text-royal">
                          {s.index}
                        </span>
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  href="https://crm.codeskate.com"
                  external
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-current" />
                    Try CodeSkate CRM
                  </span>
                </Button>
                <Button
                  href={`tel:${site.phone.replace(/\s/g, "")}`}
                  external
                  variant="secondary"
                  size="lg"
                  className="w-full"
                >
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Call Now
                  </span>
                </Button>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-2 block text-center text-sm text-ink-muted"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
