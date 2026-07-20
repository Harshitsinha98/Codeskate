import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share card. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#FFF8F0",
          backgroundImage:
            "radial-gradient(600px circle at 85% 12%, rgba(249,115,22,0.14), transparent 60%), radial-gradient(700px circle at 10% 95%, rgba(249,115,22,0.10), transparent 60%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#F97316",
              borderRadius: 12,
            }}
          >
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <path
                d="M4 20C8 8 24 8 28 20"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="3" fill="#FFF3E6" />
            </svg>
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#1E1E1E" }}>
            {site.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#1E1E1E",
            }}
          >
            Build software that moves
          </div>
          <div
            style={{
              fontSize: 82,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#F97316",
            }}
          >
            businesses forward.
          </div>
        </div>

        <div style={{ fontSize: 28, color: "#6B7280" }}>
          {`Web · SaaS · AI · Mobile · Enterprise — ${site.domain}`}
        </div>
      </div>
    ),
    { ...size }
  );
}
