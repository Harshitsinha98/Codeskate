/**
 * Marketing content — case studies, testimonials, stats, industries,
 * process, FAQs and clients.
 */

export const stats = [
  { value: "9", label: "Products shipped" },
  { value: "9", label: "Live in production" },
  { value: "6", label: "Industries served" },
  { value: "100%", label: "Full ownership" },
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
  "Divine Karigari", "Kuber Maheshwari", "Align Aesthetic Dental Hub",
  "Shivis Elegance", "Saran Tax Solution", "Pragat Hanuman Ji",
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
    slug: "divine-karigari",
    client: "Divine Karigari",
    title: "A gifting marketplace with a full commerce back office",
    category: "Ecommerce · Full-stack platform",
    year: "2026",
    cover: "from-pink-500 via-rose-500 to-royal",
    url: "https://www.divinekarigari.com",
    summary:
      "A handcrafted and personalised gifts store with a role-aware admin portal — catalog with variants and personalisation, Razorpay checkout, Shiprocket shipping and returns, wallet credit and automated email, SMS and abandoned-cart flows.",
    problem:
      "An artisan gifting brand needed far more than a storefront: personalised products, gifting occasions, shipping across India, returns, and a team that could run orders and inventory without touching code.",
    research:
      "We mapped the full order lifecycle — browse, personalise, pay, ship, track, return, refund — and designed the data model around it first, so every later feature had a home.",
    approach:
      "A customer store with personalisation, wishlist, wallet and order tracking, plus a separate admin portal with staff roles (super admin, order manager, inventory manager) for products, coupons, customers, returns, reviews and reports.",
    build:
      "Next.js and TypeScript on PostgreSQL with a 26-model Prisma schema and 90 API routes. Razorpay with server-side verification and webhooks, Shiprocket for AWB, tracking and returns, Resend email, MSG91 SMS, and separate signed JWT sessions for customers and staff.",
    services: ["Website Development", "UI / UX Design", "Maintenance & Growth"],
    metrics: [
      { value: "26", label: "data models" },
      { value: "90", label: "API routes" },
      { value: "3", label: "staff roles" },
    ],
    before: "No online store · personalised orders handled by hand",
    after: "Full storefront + admin portal · payments · shipping · returns · automated comms",
  },
  {
    slug: "kuber-maheshwari",
    client: "Kuber Maheshwari",
    title: "A bhajan singer's site with ticketing and QR gate check-in",
    category: "Events & Music · Ticketing platform",
    year: "2026",
    cover: "from-amber-500 via-orange-600 to-rose-900",
    url: "https://kuber-maheshwari.vercel.app",
    summary:
      "A bilingual (Hindi + English) official site for an Indore bhajan singer, with event ticketing via Razorpay, signed QR e-tickets, a phone-based gate scanner, and Instagram and Facebook feeds rendered natively.",
    problem:
      "Events were promoted on social media and tickets were managed by hand — no single place for fans, no reliable way to sell seats, and no way to check people in at the gate.",
    research:
      "The audience is devotional, mobile-first and bilingual, and gates are busy and offline-ish — so ticketing had to be dead simple for fans and forgery-proof and instant for volunteers.",
    approach:
      "A cinematic public site (arch hero, pinned horizontal services, scroll-lit text) plus Google login, ticket types with seat holds, QR e-tickets by email, and /admin/scan — any phone becomes a gate scanner with green/amber/red results.",
    build:
      "Next.js, Tailwind CSS 4, Prisma and PostgreSQL, NextAuth, Razorpay with webhook backup, Resend, Vercel Blob, Framer Motion and Lenis. Signed QR codes, atomic check-ins across multiple gates, Apple and Google Wallet passes, and a weekly cron that refreshes the Instagram token.",
    services: ["Website Development", "UI / UX Design", "Branding"],
    metrics: [
      { value: "QR", label: "signed e-tickets" },
      { value: "Multi-gate", label: "atomic check-in" },
      { value: "Hi + En", label: "bilingual" },
    ],
    before: "Social-only promotion · manual ticket lists · no gate control",
    after: "Official site · online ticketing · phone-based QR check-in · live social feeds",
  },
  {
    slug: "align-dental",
    client: "Align Aesthetic Dental Hub",
    title: "An orthodontist's site with online tokens and a live clinic queue",
    category: "Healthcare · Booking system",
    year: "2026",
    cover: "from-teal-600 via-cyan-700 to-rose-600",
    url: "https://www.alignaestheticdentalhub.com",
    summary:
      "The website and token system for an orthodontist in Bhopal — patients book a 15-minute token online, reception runs a live queue, and a waiting-room screen shows who's being seen next.",
    problem:
      "Patients queued at the clinic with no idea when they'd be seen, and reception juggled phone calls, walk-ins and a paper register.",
    research:
      "Tokens had to work for every patient — no app, no login, no paid SMS — and be impossible to double-book even when reception and patients book at the same moment.",
    approach:
      "Online tokens in 15-minute slots up to 14 days ahead, a passcode-protected reception and doctor panel with 'now serving', walk-ins and patient search, a TV queue screen, and patient-side saving (token image, calendar, share, SMS draft).",
    build:
      "Next.js 16, React 19 and Tailwind CSS 4 on Turso/SQLite. A partial unique index makes double-booking impossible at the database level, backed by a multi-process race test. Google reviews sync, treatment pages and an AI assistant that works without an API key.",
    services: ["Website Development", "UI / UX Design", "AI Automation"],
    metrics: [
      { value: "15-min", label: "token slots" },
      { value: "0", label: "double bookings" },
      { value: "Live", label: "clinic queue" },
    ],
    before: "Walk-in queues · phone bookings · paper register",
    after: "Online tokens · live reception queue · waiting-room screen",
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
  {
    slug: "barber-now",
    client: "BarberNow",
    title: "A salon discovery app with a live virtual queue",
    category: "Beauty & Wellness · Consumer product",
    year: "2026",
    cover: "from-amber-400 via-orange-500 to-fuchsia-700",
    url: "https://barber-now-brown.vercel.app",
    summary:
      "Our own consumer product for India: find salons near you, see the live queue, book a service or slot, and walk in exactly when it's your turn. Phase 1 — the customer web app — is live.",
    problem:
      "Customers waste time sitting in salon queues, and salons have no simple way to show availability or take bookings online.",
    research:
      "Most salon visits in India are walk-ins, so instead of forcing appointments the product leads with a virtual queue — 'people ahead' and an estimated wait — with slot booking as an option.",
    approach:
      "Location-based discovery with search, city filter and sort by nearest, top-rated or shortest wait; rich shop profiles; a booking flow for services, barber and queue-or-slot; a live queue tracker after booking; and a phone + OTP login.",
    build:
      "Next.js 15, React 19, TypeScript and Tailwind CSS with a custom design system. Phase 1 runs on structured mock data; the roadmap adds a barber app, a Flutter mobile app and a Node + PostgreSQL + Redis backend for the live queue.",
    services: ["UI / UX Design", "Website Development", "Mobile App Development"],
    metrics: [
      { value: "Phase 1", label: "customer app live" },
      { value: "Live", label: "queue tracker" },
      { value: "Own", label: "product" },
    ],
    before: "Waiting in line with no idea how long it'll take",
    after: "See the live queue · book online · walk in on time",
  },
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

export const techStack = [
  "Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion",
  "Node.js", "Swift", "Flutter", "React Native", "GraphQL",
  "Sanity", "Shopify", "Supabase", "PostgreSQL", "AWS",
  "Vercel", "Cloudflare", "OpenAI", "Claude", "Figma",
];
