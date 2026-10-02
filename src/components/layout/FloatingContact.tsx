"use client";

import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

const HIDDEN_PREFIXES = ["/client", "/employee", "/admin", "/checkout", "/login", "/register", "/forgot-password", "/reset-password"];

/** Compact floating WhatsApp bubble (public marketing pages only). Expands on hover. */
export function FloatingContact() {
  const pathname = usePathname();
  if (HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  const wa = `https://wa.me/${site.whatsapp.replace(/[^0-9]/g, "")}`;

  return (
    <a
      href={wa}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-12 items-center gap-0 overflow-hidden rounded-full border border-white/10 bg-night/90 pl-3.5 pr-3.5 text-white shadow-night-card backdrop-blur-xl transition-all duration-300 ease-premium hover:gap-2 hover:pr-4"
    >
      <span className="relative text-[#25D366]">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
          <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.2-.3.3-.5v-.5c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.5 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2l-.3-.2Z" />
        </svg>
        <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full border-2 border-night bg-[#25D366]" />
      </span>
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-medium opacity-0 transition-all duration-300 ease-premium group-hover:max-w-[8rem] group-hover:opacity-100">
        Chat with us
      </span>
    </a>
  );
}
