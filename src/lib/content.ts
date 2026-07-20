/**
 * Marketing content — case studies, testimonials, stats, industries,
 * process, FAQs, awards and clients. All fictional but concrete.
 */

export const stats = [
  { value: "5+", label: "Products shipped" },
  { value: "4", label: "Live in production" },
  { value: "5", label: "Industries served" },
  { value: "100%", label: "Full ownership" },
];

/** Home trust bar — clean, customer-facing stats. */
export const trustStats = [
  { value: "150+", label: "Projects Delivered" },
  { value: "40+", label: "Happy Clients" },
  { value: "9", label: "Years Experience" },
  { value: "24/7", label: "Support" },
];

/** "Why CodeSkate" reasons — simple icon cards on the home page. */
export const whyCodeskate = [
  {
    title: "Dedicated Team",
    detail:
      "A senior team assigned to your project end to end — one point of contact who owns your timeline, budget and communication.",
  },
  {
    title: "Transparent Process",
    detail:
      "Every branch ships to a live preview and every week ends with a clear update. You see exactly what we're building, as we build it.",
  },
  {
    title: "Fast Delivery",
    detail:
      "Focused sprints, no bloat. Most websites ship in 1–2 weeks and products in weeks, not quarters — without cutting corners.",
  },
  {
    title: "Scalable Architecture",
    detail:
      "Built to grow from day one — clean code, solid databases and infrastructure that handles 10 users or 10 million.",
  },
  {
    title: "Modern Technologies",
    detail:
      "A proven, scalable stack — Next.js, React, TypeScript and cloud-native infrastructure. No legacy, no lock-in.",
  },
  {
    title: "Post Launch Support",
    detail:
      "We stay after launch with proactive maintenance, monitoring, backups and a roadmap of improvements.",
  },
];

/** Client dashboard preview — what happens after a client hires CodeSkate. */
export const dashboardFlow = [
  { title: "Login", detail: "Secure access to your private client portal." },
  { title: "Dashboard", detail: "Everything about your project in one place." },
  { title: "Project Timeline", detail: "Live milestones and progress in real time." },
  { title: "Files", detail: "Designs, docs and deliverables, always available." },
  { title: "Payments", detail: "Transparent invoices and milestone billing." },
  { title: "Support", detail: "Message your team and get help fast." },
];

export const clients = [
  "Saran Tax Solution", "Pragat Hanuman Ji", "Shivis Elegance",
];

export type CaseStudy = {
  slug: string;
  client: string;
  title: string;
  category: string;
  year: string;
  cover: string; // gradient class token
  url: string; // live production URL
  summary: string;
  problem: string;
  research: string;
  approach: string;
  build: string;
  services: string[];
  metrics: { value: string; label: string }[];
  before: string;
  after: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "saran-tax-solution",
    client: "Saran Tax Solution",
    title: "A tax consultancy site that brings in real leads",
    category: "Finance · Marketing Site",
    year: "2024",
    cover: "from-emerald-500 via-teal-500 to-cyan-500",
    url: "https://sarantaxsolution.com",
    summary:
      "An SEO-optimized marketing site with a service catalog, appointment booking and a lead-capture funnel for an established tax consultancy.",
    problem:
      "An established tax consultancy had zero digital presence and was losing leads to competitors with modern sites.",
    research:
      "The site was structured around the services people actually search for, so the practice shows up at the moment of need.",
    approach:
      "Service pages with structured data, appointment booking, a blog/CMS, lead forms and WhatsApp chat — all built to convert organic visitors into enquiries.",
    build:
      "Built on Next.js and Tailwind with Sanity CMS for content and Resend for lead notifications.",
    services: ["Website Development", "Digital Marketing", "Branding"],
    metrics: [
      { value: "Live", label: "for a real client" },
      { value: "Organic", label: "inbound leads" },
      { value: "SEO", label: "structured data" },
    ],
    before: "No digital presence · leads lost to competitors",
    after: "Live site generating genuine inbound leads via organic search",
  },
  {
    slug: "pragat-hanuman-ji",
    client: "Pragat Hanuman Ji",
    title: "A temple site for events, donations and community",
    category: "Community · Non-profit",
    year: "2024",
    cover: "from-amber-500 via-orange-500 to-royal",
    url: "https://pragathanumanji.in",
    summary:
      "A devotional site with an event calendar, online donations, a photo gallery and a newsletter — a warm, accessible home for a temple community.",
    problem:
      "The temple needed a digital presence for event announcements, donations and devotee engagement.",
    research:
      "It was designed for a wide age range and a mixed-language audience, keeping every flow — especially donations — simple and reassuring.",
    approach:
      "An event calendar, an online donation flow, a photo gallery, multi-language support and a newsletter.",
    build:
      "Built on Next.js and Tailwind with Razorpay for donations and Cloudinary for media.",
    services: ["Website Development", "UI / UX Design"],
    metrics: [
      { value: "Live", label: "in production" },
      { value: "Razorpay", label: "donations" },
      { value: "Multi-lang", label: "accessible" },
    ],
    before: "No digital presence · no channel for events or donations",
    after: "Event calendar · online donations · engaged community",
  },
  {
    slug: "shivis-elegance",
    client: "Shivis Elegance",
    title: "A jewelry store with a full admin backend",
    category: "Ecommerce · Full-stack",
    year: "2025",
    cover: "from-rose-400 via-royal to-amber-500",
    url: "https://shivis-elegance1.vercel.app",
    summary:
      "Two connected systems: a customer store with OTP login and dual payment gateways, plus a separate admin dashboard for inventory, orders, customers, revenue and coupons — with Shiprocket auto-generating AWBs on order.",
    problem:
      "A jewelry brand needed more than a storefront — a complete system to manage products, inventory, orders, customers and revenue alongside the shop.",
    research:
      "It was treated as an operations problem as much as a storefront one, so the admin side got the same care as the customer experience.",
    approach:
      "A customer store with OTP-based login, self-serve order tracking and returns, and a separate admin dashboard for full inventory, order, customer, revenue and coupon management.",
    build:
      "Built on Next.js with a Node/Express and PostgreSQL backend, Razorpay and Stripe gateways, and Shiprocket wired in to auto-generate AWBs the moment an order is placed.",
    services: ["Website Development", "UI / UX Design", "Branding"],
    metrics: [
      { value: "Live", label: "order lifecycle" },
      { value: "2", label: "payment gateways" },
      { value: "Shiprocket", label: "auto AWB" },
    ],
    before: "Storefront only · manual inventory and order ops",
    after: "End-to-end store + admin dashboard · payments · auto shipping",
  },
];

export const getCaseStudy = (slug: string) =>
  caseStudies.find((c) => c.slug === slug);

export const industries = [
  { name: "Fintech", detail: "Banking, payments, lending and wealth products people trust with their money." },
  { name: "Healthcare", detail: "Compliant, human digital health experiences from clinic to home." },
  { name: "SaaS", detail: "B2B platforms designed to activate, retain and expand." },
  { name: "Ecommerce", detail: "Storefronts and brands built to sell at a premium." },
  { name: "Real Estate", detail: "Immersive property and PropTech experiences." },
  { name: "Education", detail: "Learning products that keep people coming back." },
  { name: "Hospitality", detail: "Booking and brand experiences worthy of the stay." },
  { name: "Enterprise", detail: "Internal tools and platforms teams actually enjoy using." },
];

export const process = [
  {
    phase: "01",
    title: "Discover",
    detail:
      "We start with your business, not your website. Goals, customers, economics and constraints — mapped before a single pixel.",
    points: ["Stakeholder workshops", "Market & user research", "Success metrics defined"],
  },
  {
    phase: "02",
    title: "Plan",
    detail:
      "A clear plan: architecture, scope and roadmap — so everyone knows what we're building and why it wins.",
    points: ["Information architecture", "Scope & roadmap", "Success metrics"],
  },
  {
    phase: "03",
    title: "Design",
    detail:
      "Conversion-first interfaces crafted to the last detail, backed by a reusable system and validated with real users.",
    points: ["Design system", "High-fidelity UI", "Interactive prototypes"],
  },
  {
    phase: "04",
    title: "Develop",
    detail:
      "Type-safe, tested, fast. We ship through a preview-per-branch pipeline so you see progress every single day.",
    points: ["Modern, scalable stack", "CI/CD & previews", "Performance budget"],
  },
  {
    phase: "05",
    title: "Test",
    detail:
      "Rigorous QA, accessibility and performance checks — every flow verified before it reaches your customers.",
    points: ["QA & accessibility", "Automated tests", "Performance audits"],
  },
  {
    phase: "06",
    title: "Launch",
    detail:
      "A calm, rehearsed go-live with analytics, tracking and SEO in place — and a team watching every metric.",
    points: ["Analytics & tracking", "Zero-drama go-live", "Launch checklist"],
  },
  {
    phase: "07",
    title: "Support",
    detail:
      "We stay after launch with proactive maintenance, monitoring and a roadmap of improvements — your product keeps getting better.",
    points: ["Proactive maintenance", "Monitoring & backups", "Improvement roadmap"],
  },
];

// Pricing FAQs are centralized in `@/lib/config/faq` (single source of truth).
export { PRICING_FAQS as faqs } from "@/lib/config/faq";

export const awards = [
  { title: "Awwwards", detail: "Site of the Day ×4", year: "2023–25" },
  { title: "CSS Design Awards", detail: "Best UI / UX", year: "2024" },
  { title: "Clutch", detail: "Top B2B Company", year: "2025" },
  { title: "FWA", detail: "Site of the Day", year: "2024" },
  { title: "Webby", detail: "Nominee, Best Studio", year: "2025" },
];

export const techStack = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion",
  "Node.js", "Swift", "Flutter", "React Native", "GraphQL",
  "Sanity", "Shopify", "Supabase", "PostgreSQL", "AWS",
  "Vercel", "Cloudflare", "OpenAI", "Claude", "Figma",
];
