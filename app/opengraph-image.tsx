import { ImageResponse } from "next/og";
import { pulse } from "~/lib/api";

export const alt = "FiveD Studio — live engineering pulse";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default async function OG() {
  const [totals, members] = await Promise.all([
    pulse.totals(30).catch(() => null),
    pulse.members().catch(() => []),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#050507",
          backgroundImage:
            "radial-gradient(circle at 25% 0%, rgba(0,217,146,0.22), transparent 55%)",
          color: "#f2f2f2",
          display: "flex",
          flexDirection: "column",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: "#00d992",
            fontSize: 28,
            letterSpacing: 1.5,
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              border: "2px solid #00d992",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "monospace",
              fontWeight: 700,
              fontSize: 24,
              color: "#00d992",
            }}
          >
            5D
          </div>
          FiveD Studio
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            marginTop: "auto",
          }}
        >
          <div
            style={{
              fontSize: 84,
              fontWeight: 600,
              lineHeight: 1.05,
              letterSpacing: -2,
              color: "#ffffff",
            }}
          >
            Watch us ship.
          </div>
          <div style={{ fontSize: 32, color: "#b8b3b0", lineHeight: 1.35 }}>
            Real-time engineering pulse for a small product studio out of Saigon.
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            display: "flex",
            gap: 48,
            paddingTop: 28,
            borderTop: "1px solid #3d3a39",
          }}
        >
          <Stat value={String(members.length || 5)} label="engineers" />
          <Stat value={String(totals?.total ?? 0)} label="events / 30d" />
          <Stat value={String(totals?.prsMerged ?? 0)} label="PRs merged" />
          <Stat value={String(totals?.activeMembers ?? 0)} label="shipping" />
          <div style={{ marginLeft: "auto", color: "#8b949e", fontSize: 22, alignSelf: "flex-end" }}>
            fived-studio.github.io
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: 48,
          color: "#00d992",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: 16,
          color: "#8b949e",
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </span>
    </div>
  );
}
