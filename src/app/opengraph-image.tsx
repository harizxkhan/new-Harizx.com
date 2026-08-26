import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/config";

export const alt = `${siteConfig.name} — AI automation and digital systems`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social share card, generated at build time. Uses system fonts so no
 * font binary has to be fetched during rendering.
 */
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
          background: "#050505",
          padding: "72px",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            color: "#777777",
            fontSize: 22,
            letterSpacing: "0.14em",
          }}
        >
          <span>{siteConfig.wordmark}</span>
          <span>HARIZX.COM</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              color: "#F5F5F0",
              fontSize: 108,
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            WE BUILD WHAT
          </div>
          <div
            style={{
              display: "flex",
              color: "#FF2A1A",
              fontSize: 108,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            OTHERS CAN&apos;T.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#777777",
            fontSize: 26,
          }}
        >
          <div style={{ display: "flex", width: 46, height: 4, background: "#FF2A1A" }} />
          <span>AI automation · Websites · Apps · Content · Marketing</span>
        </div>
      </div>
    ),
    size
  );
}
