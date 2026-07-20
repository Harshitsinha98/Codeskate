/**
 * Next.js configuration.
 *
 * Adds production hardening:
 *  - `output: "standalone"` so the Docker image can ship a minimal self-contained
 *    server bundle.
 *  - Global security response headers (CSP, HSTS, framing, MIME-sniffing,
 *    referrer, permissions) applied to every route.
 *
 * The CSP is intentionally permissive enough for the Razorpay checkout widget
 * (its script/frame origins) and same-origin SSE, while disallowing arbitrary
 * third-party embedding. Tighten further once all third-party origins are known.
 */

const isProd = process.env.NODE_ENV === "production";

/** Razorpay checkout + API origins required by the payment widget. */
const razorpay = "https://checkout.razorpay.com https://api.razorpay.com https://*.razorpay.com";

const contentSecurityPolicy = [
  `default-src 'self'`,
  // Next.js requires 'unsafe-inline' for its bootstrap; 'unsafe-eval' only in dev.
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} ${razorpay}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  // SSE / fetch to same-origin + Razorpay; ws: for dev HMR.
  `connect-src 'self' ${razorpay}${isProd ? "" : " ws:"}`,
  `frame-src 'self' ${razorpay}`,
  `frame-ancestors 'self'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `object-src 'none'`,
  ...(isProd ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  // HSTS only in production (avoids pinning HTTP dev origins).
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]
    : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "s.wordpress.com" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
