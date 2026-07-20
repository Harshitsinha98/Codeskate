/**
 * Central brand + navigation configuration.
 * CodeSkate — a product engineering company.
 */

export const site = {
  name: "CodeSkate",
  legalName: "CodeSkate",
  domain: "codeskate.com",
  url: "https://codeskate.com",
  tagline: "Engineering Software That Scales.",
  description:
    "CodeSkate is a product engineering company. We design and build websites, SaaS products, AI automation, mobile apps and enterprise software that help businesses grow faster.",
  email: "hello@codeskate.com",
  phone: "+91 96530 43939",
  whatsapp: "+919653043939",
  calendly: "https://calendly.com/codeskate/intro",
  address: {
    line1: "Remote-first studio",
    line2: "Serving clients across India & worldwide",
    country: "India",
  },
  socials: [
    { label: "GitHub", href: "https://github.com/Harshitsinha98" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/harshit-sinha98/" },
  ],
} as const;

/**
 * Build a WhatsApp click-to-chat link from the sitewide number.
 * Every "Enquire Now" / CRM CTA routes through this, so updating the number
 * once in `site.whatsapp` updates the whole site.
 */
export function waLink(message?: string): string {
  const number = site.whatsapp.replace(/[^0-9]/g, "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export type NavItem = {
  label: string;
  href: string;
  hasMega?: boolean;
};

export const primaryNav: NavItem[] = [
  { label: "Services", href: "/services", hasMega: true },
  { label: "Pricing", href: "/pricing" },
  { label: "Products", href: "/products" },
  { label: "Portfolio", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav = {
  Services: [
    { label: "Website Development", href: "/services/web-development" },
    { label: "Mobile App Development", href: "/services/mobile-apps" },
    { label: "UI / UX Design", href: "/services/ui-ux-design" },
    { label: "Branding", href: "/services/branding" },
    { label: "Digital Marketing", href: "/services/digital-marketing" },
    { label: "Paid Advertising", href: "/services/paid-advertising" },
    { label: "AI Automation", href: "/services/ai-automation" },
    { label: "Maintenance & Growth", href: "/services/maintenance-growth" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Our Process", href: "/process" },
    { label: "Industries", href: "/industries" },
    { label: "Careers", href: "/careers" },
    { label: "Contact", href: "/contact" },
  ],
  Resources: [
    { label: "Products", href: "/products" },
    { label: "Case Studies", href: "/work" },
    { label: "Pricing", href: "/pricing" },
    { label: "Journal", href: "/blog" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
} as const;
