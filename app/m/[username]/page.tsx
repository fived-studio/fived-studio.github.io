import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "~/components/SiteHeader";
import { pulse, type ActivityEvent } from "~/lib/api";

// Static export pre-renders one HTML file per username at build time.
// generateStaticParams must return synchronously, so we keep a fallback
// roster here. Activity itself is fetched live per page.
const ROSTER = {
  hgbaooo: { name: "Huỳnh Gia Bảo", role: "Fullstack Engineer" },
  nquynqthanq: { name: "Nguyễn Quốc Thắng", role: "Frontend · UI/UX" },
  thvnhtai: { name: "Nguyễn Thành Tài", role: "Frontend · UI/UX" },
  sloweyyy: { name: "Trương Lê Vĩnh Phúc", role: "Product · DevOps · Fullstack" },
  TrTueTah: { name: "Trần Tuệ Tánh", role: "Fullstack Engineer" },
} as const;

type Username = keyof typeof ROSTER;

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(ROSTER).map((username) => ({ username }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!(username in ROSTER)) notFound();
  const fallback = ROSTER[username as Username];

  const [profile, events] = await Promise.all([
    pulse.member(username).catch(() => null),
    pulse.events(20, username).then((r) => r.data).catch(() => [] as ActivityEvent[]),
  ]);

  const name = profile?.name ?? fallback.name;
  const role = profile?.role ?? fallback.role;
  const avatarUrl = profile?.avatarUrl ?? `https://github.com/${username}.png`;

  const badge = `[![${name} on FiveD Pulse](https://api.fived.studio/badge/${username}.svg)](https://fived-studio.github.io/m/${username})`;

  return (
    <>
      <SiteHeader />

      <main>
        <section className="section" style={{ paddingTop: 96 }}>
          <div className="member-hero">
            <img
              src={avatarUrl}
              alt={name}
              width={120}
              height={120}
              style={{ borderRadius: "50%", border: "1px solid var(--border)" }}
            />
            <div>
              <span className="eyebrow" style={{ marginBottom: 16 }}>
                <span className="dot" />
                @{username}
              </span>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.65px",
                  lineHeight: 1.05,
                  margin: "16px 0 12px",
                }}
              >
                {name}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
                {role} ·{" "}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                  github.com/{username}
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section-head">
            <h2>Recent activity</h2>
            <p>
              Last {events.length || 0} events from {username} across the FiveD org.
            </p>
          </header>

          {events.length > 0 ? (
            <ul className="event-list">
              {events.map((e) => (
                <li key={e.id}>
                  <span className="event-summary">{e.summary}</span>
                  <time dateTime={e.occurredAt}>{relative(e.occurredAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <div
              style={{
                maxWidth: 600,
                margin: "0 auto",
                padding: "32px 28px",
                border: "1px dashed var(--border-dashed)",
                borderRadius: "var(--r-card)",
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "0.85rem",
                color: "var(--text-mute)",
              }}
            >
              <div style={{ color: "var(--accent)", marginBottom: 8 }}>$ pulse status</div>
              <div>No events tracked yet for @{username}.</div>
              <div style={{ marginTop: 12 }}>
                See full footprint at{" "}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  github.com/{username}
                </a>
              </div>
            </div>
          )}
        </section>

        <section className="section">
          <header className="section-head">
            <h2>Embed on your README</h2>
            <p>
              Paste this badge into your GitHub profile README — it updates automatically with
              your live stats.
            </p>
          </header>
          <div className="code-block" style={{ maxWidth: 720 }}>
            <div className="code-block-head">
              <span className="code-block-dots">
                <span /><span /><span />
              </span>
              <span>README.md</span>
            </div>
            <pre>
              <code>{badge}</code>
            </pre>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-row">
          <span>© {new Date().getFullYear()} FiveD Studio</span>
          <span>
            <Link href="/">← back to studio</Link>
          </span>
        </div>
      </footer>
    </>
  );
}

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
