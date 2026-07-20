import type { ReactNode } from "react";

/** Colorful brand-style SVG icon per service slug. Shared by cards sitewide. */
export const serviceIcons: Record<string, ReactNode> = {
  "web-development": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <path d="M33 4v40l9-4V8l-9-4Z" fill="#1D4ED8" />
      <path d="M33 4 14 22l5 4L33 14V4ZM14 26l19 18V34L19 22l-5 4Z" fill="#3B82F6" />
      <path d="m6 16-3 2v12l3 2 8-6-8-10Z" fill="#60A5FA" />
    </svg>
  ),
  "mobile-apps": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <rect x="12" y="4" width="24" height="40" rx="5" fill="#16A34A" />
      <rect x="15" y="9" width="18" height="28" rx="2" fill="#DCFCE7" />
      <rect x="17" y="12" width="14" height="4" rx="1" fill="#4ADE80" />
      <rect x="17" y="18" width="9" height="3" rx="1" fill="#86EFAC" />
      <rect x="17" y="23" width="12" height="3" rx="1" fill="#86EFAC" />
    </svg>
  ),
  "ui-ux-design": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <rect x="6" y="6" width="17" height="17" rx="4" fill="#F97316" />
      <rect x="25" y="6" width="17" height="17" rx="8.5" fill="#8B5CF6" />
      <rect x="6" y="25" width="17" height="17" rx="4" fill="#EC4899" />
      <circle cx="33.5" cy="33.5" r="8.5" fill="#06B6D4" />
    </svg>
  ),
  branding: (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <path d="M24 4l4.9 12.6L42 18l-10 8.6L35.1 40 24 32.8 12.9 40 16 26.6 6 18l13.1-1.4L24 4Z" fill="#F59E0B" />
      <path d="M24 12l2.7 7 7.3.8-5.5 4.7 1.7 7.4L24 28l-6.2 3.9 1.7-7.4L14 19.8l7.3-.8L24 12Z" fill="#FDE68A" />
    </svg>
  ),
  "digital-marketing": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <circle cx="20" cy="20" r="13" fill="none" stroke="#DC2626" strokeWidth="5" />
      <rect x="29" y="27" width="15" height="6" rx="3" transform="rotate(45 29 27)" fill="#991B1B" />
      <path d="M14 22l4-5 4 3 5-7" stroke="#16A34A" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  "paid-advertising": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <rect x="4" y="16" width="16" height="28" rx="8" transform="rotate(-30 12 30)" fill="#FBBC04" />
      <rect x="20" y="4" width="16" height="40" rx="8" transform="rotate(30 28 24)" fill="#4285F4" />
      <circle cx="11" cy="37" r="7" fill="#34A853" />
    </svg>
  ),
  "ai-automation": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <rect x="8" y="12" width="32" height="26" rx="8" fill="#8B5CF6" />
      <circle cx="18" cy="25" r="3.5" fill="#EDE9FE" />
      <circle cx="30" cy="25" r="3.5" fill="#EDE9FE" />
      <rect x="20" y="4" width="8" height="6" rx="3" fill="#A78BFA" />
      <rect x="14" y="31" width="20" height="3" rx="1.5" fill="#C4B5FD" />
    </svg>
  ),
  "maintenance-growth": (
    <svg viewBox="0 0 48 48" className="h-9 w-9">
      <circle cx="24" cy="24" r="19" fill="#0EA5E9" />
      <circle cx="24" cy="24" r="9" fill="#E0F2FE" />
      <path d="M24 5v10M24 33v10M5 24h10M33 24h10" stroke="#0369A1" strokeWidth="6" />
    </svg>
  ),
};

export const fallbackServiceIcon: ReactNode = (
  <svg viewBox="0 0 48 48" className="h-9 w-9">
    <rect x="6" y="6" width="36" height="36" rx="9" fill="#F97316" />
    <path d="M20 17l-7 7 7 7M28 17l7 7-7 7" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const getServiceIcon = (slug: string): ReactNode =>
  serviceIcons[slug] ?? fallbackServiceIcon;

/** Accent title color per service slug (matches the DiziCode-style pricing cards). */
export const serviceAccentText: Record<string, string> = {
  "web-development": "text-blue-600",
  "mobile-apps": "text-green-600",
  "ui-ux-design": "text-violet-600",
  branding: "text-amber-500",
  "digital-marketing": "text-red-600",
  "paid-advertising": "text-sky-600",
  "ai-automation": "text-violet-600",
  "maintenance-growth": "text-cyan-600",
};
