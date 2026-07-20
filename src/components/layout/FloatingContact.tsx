"use client";

import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const HIDDEN_PREFIXES = ["/client", "/employee", "/admin", "/checkout", "/login", "/register", "/forgot-password", "/reset-password"];

/** Floating WhatsApp chat + call buttons (public marketing pages only). */
export function FloatingContact() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const wa = `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <a
        href={`tel:${site.phone.replace(/\s/g, "")}`}
        aria-label="Call us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-royal text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
      >
        <Phone className="h-5 w-5" />
      </a>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-full bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white shadow-lift transition-transform duration-200 hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.3-.2Z" />
        </svg>
        Chat on WhatsApp
      </a>
    </div>
  );
}
