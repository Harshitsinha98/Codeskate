/**
 * PHASE 3 — Homepage marketing content.
 *
 * Display-only copy for the redesigned homepage sections. Keyed to existing
 * service/case-study slugs so nothing in the service catalog, pricing engine
 * or backend is touched. Pure presentation data.
 */

// ---------------------------------------------------------------- trust bar

export const trustBarStats = [
  { value: 9, suffix: "", label: "Products shipped" },
  { value: 6, suffix: "", label: "Industries served" },
  { value: 2, suffix: "", label: "In-house products" },
  { value: 24, suffix: "h", label: "Avg. response time" },
] as const;

// ---------------------------------------------------------------- services

export type ServiceStory = {
  slug: string;
  headline: string;
  problem: string;
  solution: string;
  outcome: string;
  benefits: string[];
};

/** Problem → Solution → Outcome framing, keyed to catalog service slugs. */
export const serviceStories: Record<string, ServiceStory> = {
  "web-development": {
    slug: "web-development",
    headline: "Build blazing-fast websites that turn visitors into customers.",
    problem: "Slow, generic sites that rank nowhere and convert no one.",
    solution: "Conversion-first builds on a modern, SEO-ready stack.",
    outcome: "More qualified traffic and demos, at a lower cost per lead.",
    benefits: ["SEO optimized", "Sub-second loads", "Modern, on-brand UI"],
  },
  "mobile-apps": {
    slug: "mobile-apps",
    headline: "Ship iOS & Android apps people actually keep open.",
    problem: "Clunky apps with poor retention and slow release cycles.",
    solution: "Native-quality apps with a shared design system and CI/CD.",
    outcome: "Higher activation, better ratings and faster iteration.",
    benefits: ["iOS & Android", "Offline-ready", "Analytics built in"],
  },
  "ui-ux-design": {
    slug: "ui-ux-design",
    headline: "Design interfaces that feel effortless and premium.",
    problem: "Confusing flows that lose users before the aha moment.",
    solution: "Research-led UX and a reusable, accessible design system.",
    outcome: "Fewer drop-offs and a product that sells its own quality.",
    benefits: ["User research", "Design system", "WCAG accessible"],
  },
  branding: {
    slug: "branding",
    headline: "Craft a brand that lets you charge what you're worth.",
    problem: "A look that signals 'budget' and undercuts your pricing.",
    solution: "A cohesive identity, voice and visual system end to end.",
    outcome: "Stronger recall, trust and premium positioning.",
    benefits: ["Logo & identity", "Brand guidelines", "Launch assets"],
  },
  "digital-marketing": {
    slug: "digital-marketing",
    headline: "Turn search and content into a compounding pipeline.",
    problem: "No inbound — every lead depends on manual outbound.",
    solution: "Technical SEO plus intent-mapped content and analytics.",
    outcome: "A durable channel that keeps producing leads for free.",
    benefits: ["Technical SEO", "Content engine", "Measurable ROI"],
  },
  "paid-advertising": {
    slug: "paid-advertising",
    headline: "Get quick, profitable leads from paid channels.",
    problem: "Ad spend that burns budget without predictable returns.",
    solution: "Tightly targeted campaigns with landing pages that convert.",
    outcome: "A lower cost per acquisition and a scalable growth lever.",
    benefits: ["Precise targeting", "Landing pages", "Weekly reporting"],
  },
  "ai-automation": {
    slug: "ai-automation",
    headline: "Automate the busywork with reliable AI agents.",
    problem: "Teams drowning in repetitive, manual, error-prone tasks.",
    solution: "Guard-railed AI agents wired into your existing tools.",
    outcome: "Hundreds of hours saved and faster, consistent workflows.",
    benefits: ["Custom agents", "Human-in-the-loop", "Tool integrations"],
  },
  "maintenance-growth": {
    slug: "maintenance-growth",
    headline: "Keep your product fast, secure and always improving.",
    problem: "Products that rot after launch — bugs, drift, downtime.",
    solution: "Proactive monitoring, maintenance and a growth roadmap.",
    outcome: "Reliable uptime and a product that compounds over time.",
    benefits: ["24/7 monitoring", "Security patching", "Roadmap of wins"],
  },
};

// ---------------------------------------------------------------- why

export type WhyBlock = {
  title: string;
  detail: string;
  value: string;
};

/** Business-value framing for the "Why CodeSkate" blocks. */
export const whyBlocks: WhyBlock[] = [
  {
    title: "Senior Engineers",
    detail:
      "Your project is owned end to end by senior engineers — never handed off to juniors or offshore contractors.",
    value: "Fewer bugs, better decisions, code you can build on.",
  },
  {
    title: "Scalable Architecture",
    detail:
      "Clean code, solid databases and cloud-native infrastructure designed to grow from ten users to ten million.",
    value: "No costly rewrites as you scale.",
  },
  {
    title: "Transparent Development",
    detail:
      "Every branch ships to a live preview and every week ends with a clear update. You always see what we're building.",
    value: "Full visibility, zero surprises.",
  },
  {
    title: "Fast Delivery",
    detail:
      "Focused sprints with no bloat. Most websites ship in one to two weeks and products in weeks, not quarters.",
    value: "Get to market — and to revenue — sooner.",
  },
  {
    title: "Long-Term Support",
    detail:
      "We stay after launch with proactive maintenance, monitoring, backups and a roadmap of improvements.",
    value: "A partner for the long run, not a one-off vendor.",
  },
  {
    title: "Modern Technology",
    detail:
      "A proven, scalable stack — Next.js, React, TypeScript and cloud-native tooling. No legacy, no lock-in.",
    value: "Future-proof foundations you fully own.",
  },
];

// ---------------------------------------------------------------- process

export type ProcessPhase = {
  phase: string;
  title: string;
  detail: string;
};

/** Seven-step delivery process for the interactive timeline. */
export const processPhases: ProcessPhase[] = [
  { phase: "01", title: "Discovery", detail: "Goals, users and constraints mapped before a single pixel." },
  { phase: "02", title: "Planning", detail: "Architecture, scope and roadmap agreed so everyone's aligned." },
  { phase: "03", title: "Design", detail: "Conversion-first UI backed by a reusable design system." },
  { phase: "04", title: "Development", detail: "Type-safe, tested code shipped through preview-per-branch." },
  { phase: "05", title: "Testing", detail: "QA, accessibility and performance checks on every flow." },
  { phase: "06", title: "Deployment", detail: "A calm, rehearsed go-live with analytics and tracking in place." },
  { phase: "07", title: "Support", detail: "Proactive maintenance and a roadmap that keeps improving." },
];

// ---------------------------------------------------------------- case studies

export type CaseMeta = {
  slug: string;
  industry: string;
  problem: string;
  solution: string;
  tech: string[];
  result: string;
  image: string;
};

/** Extra software-project framing, keyed to caseStudies slugs. */
export const caseMeta: Record<string, CaseMeta> = {
  "divine-karigari": {
    slug: "divine-karigari",
    industry: "Ecommerce",
    problem: "An artisan gifting brand needed a store and a back office.",
    solution: "A personalised-gifts store plus a role-based admin portal with payments, shipping and returns.",
    tech: ["Next.js", "PostgreSQL", "Prisma", "Razorpay", "Shiprocket", "Resend"],
    result: "Full commerce platform live",
    image: "/work/divine-karigari.jpg",
  },
  "kuber-maheshwari": {
    slug: "kuber-maheshwari",
    industry: "Events & Music",
    problem: "Events were sold and checked in by hand.",
    solution: "A bilingual artist site with Razorpay ticketing, signed QR e-tickets and a phone gate scanner.",
    tech: ["Next.js", "Prisma", "NextAuth", "Razorpay", "Framer Motion", "Lenis"],
    result: "Online ticketing + QR check-in live",
    image: "/work/kuber-maheshwari.jpg",
  },
  "align-dental": {
    slug: "align-dental",
    industry: "Healthcare",
    problem: "Patients queued at the clinic with no idea when they'd be seen.",
    solution: "Online 15-minute tokens, a live reception queue and a waiting-room screen.",
    tech: ["Next.js 16", "React 19", "Tailwind 4", "Turso", "Google Places"],
    result: "Live token booking + clinic queue",
    image: "/work/align-dental.jpg",
  },
  "barber-now": {
    slug: "barber-now",
    industry: "Beauty & Wellness",
    problem: "Salon customers waste time sitting in queues.",
    solution: "Salon discovery with a live virtual queue, slot booking and OTP login.",
    tech: ["Next.js 15", "React 19", "TypeScript", "Tailwind"],
    result: "Phase 1 customer app live",
    image: "/work/barber-now.jpg",
  },
  "saran-tax-solution": {
    slug: "saran-tax-solution",
    industry: "Finance",
    problem: "An established consultancy had zero digital presence.",
    solution: "An SEO-optimized site with booking and a lead-capture funnel.",
    tech: ["Next.js", "Tailwind", "Sanity CMS", "Resend"],
    result: "Generating real inbound leads",
    image: "/work/saran-tax-solution.jpg",
  },
  "pragat-hanuman-ji": {
    slug: "pragat-hanuman-ji",
    industry: "Community",
    problem: "The temple needed a home for events, donations and engagement.",
    solution: "A devotional site with a calendar, donations and a gallery.",
    tech: ["Next.js", "Tailwind", "Razorpay", "Cloudinary"],
    result: "Live in production",
    image: "/work/pragat-hanuman-ji.jpg",
  },
  "shivis-elegance": {
    slug: "shivis-elegance",
    industry: "Ecommerce",
    problem: "A jewelry brand needed a store plus full back-office ops.",
    solution: "A customer store and a separate admin dashboard with auto-shipping.",
    tech: ["Next.js", "Express", "PostgreSQL", "Razorpay", "Shiprocket"],
    result: "End-to-end order lifecycle live",
    image: "/work/shivis-elegance.jpg",
  },
};

// ---------------------------------------------------------------- tech stack

export type TechGroup = {
  category: string;
  items: string[];
};

/** Technologies grouped by discipline for the stack showcase. */
export const techGroups: TechGroup[] = [
  { category: "Frontend", items: ["Next.js", "React", "TypeScript", "Tailwind CSS"] },
  { category: "Backend", items: ["Node.js", "Laravel", "PHP", "Python"] },
  { category: "Database", items: ["PostgreSQL", "MongoDB", "Firebase", "Redis"] },
  { category: "Cloud", items: ["AWS", "Vercel", "Cloudflare", "GCP"] },
  { category: "AI", items: ["Claude", "OpenAI", "LangChain", "RAG"] },
  { category: "DevOps", items: ["Docker", "GitHub Actions", "Terraform", "Kubernetes"] },
];
