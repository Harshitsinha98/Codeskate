import Link from "next/link";
import { cn } from "@/lib/utils";
import { site } from "@/lib/site";

/**
 * CodeSkate wordmark — an animated lightning bolt in a rounded orange tile,
 * with a two-tone "Code·Skate" wordmark. Animation is pure CSS (see
 * globals.css: `logo-*` keyframes) so this stays a server component and works
 * inside every layout, including the dashboards.
 */
export function Logo({
  className,
  onClick,
  tone = "light",
}: {
  className?: string;
  onClick?: () => void;
  /** "dark" renders a white wordmark for night surfaces. */
  tone?: "light" | "dark";
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name} — home`}
      className={cn("logo group inline-flex items-center gap-2.5", className)}
    >
      <span className="logo-tile relative inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px]">
        {/* gradient tile + sheen */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-[#FF9A5C] via-[#FF6A1A] to-[#E2520A]"
        />
        <span aria-hidden className="logo-sheen absolute inset-0" />
        <svg
          viewBox="0 0 24 24"
          className="logo-bolt relative h-[18px] w-[18px]"
          fill="none"
          aria-hidden
        >
          <path
            d="M13.5 2 5 13.2h5.3L9.4 22 19 10.2h-5.6L13.5 2Z"
            fill="white"
            stroke="white"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          tone === "dark" ? "text-white" : "text-ink"
        )}
      >
        Code<span className="text-royal">Skate</span>
      </span>
    </Link>
  );
}
