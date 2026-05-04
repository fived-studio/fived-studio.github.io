import { ImageResponse } from "next/og";
import { pulse } from "~/lib/api";

const ROSTER: Record<string, { name: string; role: string }> = {
  hgbaooo: { name: "Huỳnh Gia Bảo", role: "Fullstack Engineer" },
  nquynqthanq: { name: "Nguyễn Quốc Thắng", role: "Frontend · UI/UX" },
  thvnhtai: { name: "Nguyễn Thành Tài", role: "Frontend · UI/UX" },
  sloweyyy: { name: "Trương Lê Vĩnh Phúc", role: "Product · DevOps · Fullstack" },
  TrTueTah: { name: "Trần Tuệ Tánh", role: "Fullstack Engineer" },
};

export const alt = "FiveD Studio member profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(ROSTER).map((username) => ({ username }));
}

export default async function OG({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;
  const fallback = ROSTER[username] ?? { name: username, role: "Engineer" };

  const [profile, totals] = await Promise.all([
    pulse.member(username).catch(() => null),
    pulse.totals(30, username).catch(() => null),
  ]);

  const name = profile?.name ?? fallback.name;
  const role = profile?.role ?? fallback.role;

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
          {`FiveD Studio · @${username}`}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            marginTop: "auto",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={profile?.avatarUrl ?? `https://github.com/${username}.png`}
            alt={name}
            width={200}
            height={200}
            style={{
              borderRadius: 100,
              border: "3px solid #3d3a39",
              objectFit: "cover",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                fontSize: 76,
                fontWeight: 600,
                lineHeight: 1,
                letterSpacing: -1.5,
                color: "#ffffff",
              }}
            >
              {name}
            </div>
            <div style={{ fontSize: 28, color: "#b8b3b0" }}>{role}</div>
            <div
              style={{
                fontSize: 22,
                color: "#00d992",
                fontFamily: "monospace",
                marginTop: 4,
              }}
            >
              {`github.com/${username}`}
            </div>
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
          <Stat value={String(totals?.total ?? 0)} label="events / 30d" />
          <Stat value={String(totals?.prsMerged ?? 0)} label="PRs merged" />
          <Stat value={String(totals?.pushes ?? 0)} label="pushes" />
          <Stat value={String(totals?.reviews ?? 0)} label="reviews" />
          <div style={{ marginLeft: "auto", color: "#8b949e", fontSize: 22, alignSelf: "flex-end" }}>
            {`fived-studio.github.io/m/${username}`}
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
