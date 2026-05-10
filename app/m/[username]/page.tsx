import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "~/components/SiteHeader";
import MemberActivity from "~/components/MemberActivity";
import LeetcodeHeatmap from "~/components/LeetcodeHeatmap";
import LeetcodeBadges from "~/components/LeetcodeBadges";
import { pulse, type ActivityEvent, type LeetcodeMemberStats } from "~/lib/api";

// Static export pre-renders one HTML file per username at build time.
// generateStaticParams must return synchronously, so we keep a fallback
// roster here. Activity itself is fetched live per page.
const ROSTER = {
  hgbaooo: { name: "Huỳnh Gia Bảo", role: "Fullstack Engineer" },
  nquynqthanq: { name: "Nguyễn Quốc Thắng", role: "Fullstack Engineer" },
  thvnhtai: { name: "Nguyễn Thành Tài", role: "Fullstack Engineer" },
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

  const [profile, eventsRes, leetcode] = await Promise.all([
    pulse.member(username).catch(() => null),
    pulse.events(20, username).catch(() => ({
      data: [] as ActivityEvent[],
      nextBefore: null as string | null,
    })),
    pulse.leetcode.member(username).catch(() => null as LeetcodeMemberStats | null),
  ]);
  const events = eventsRes.data;

  const name = profile?.name ?? fallback.name;
  const role = profile?.role ?? fallback.role;
  const avatarUrl = profile?.avatarUrl ?? `https://github.com/${username}.png`;

  const badge = `[![${name} on FiveD Pulse](${process.env.NEXT_PUBLIC_PULSE_API}/badge/${username}.svg)](https://fived-studio.github.io/m/${username})`;

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
          </header>

          <MemberActivity
            username={username}
            initialEvents={events}
            initialNextBefore={eventsRes.nextBefore}
          />
          {/* keep a tiny piece for crawlers (the client component fills in
              the real list at runtime) */}
          {events.length === 0 ? (
            <noscript>
              <div className="member-empty">
                <div className="member-empty-prompt">$ pulse status</div>
                <div>{`See @${username} on `}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  {`github.com/${username}`}
                </a>
                </div>
              </div>
            </noscript>
          ) : null}
        </section>

        {leetcode && leetcode.handle && !leetcode.lastError && (
          <section className="section">
            <header className="section-head">
              <h2>LeetCode</h2>
              <p>
                Synced from{" "}
                <a
                  href={`https://leetcode.com/u/${leetcode.handle}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
                >
                  @{leetcode.handle}
                </a>
                . See the{" "}
                <Link href="/leetcode/" style={{ color: "var(--accent)" }}>team leaderboard</Link>.
              </p>
            </header>

            <div className="lc-stat-grid">
              <div className="lc-stat-card">
                <span className="lc-stat-label">Total solved</span>
                <strong>{leetcode.totalSolved}</strong>
                <span className="muted">of {leetcode.totalEasy + leetcode.totalMedium + leetcode.totalHard}</span>
              </div>
              <div className="lc-stat-card">
                <span className="lc-stat-label lc-easy">Easy</span>
                <strong>{leetcode.easy}</strong>
                <span className="muted">/ {leetcode.totalEasy}</span>
              </div>
              <div className="lc-stat-card">
                <span className="lc-stat-label lc-medium">Medium</span>
                <strong>{leetcode.medium}</strong>
                <span className="muted">/ {leetcode.totalMedium}</span>
              </div>
              <div className="lc-stat-card">
                <span className="lc-stat-label lc-hard">Hard</span>
                <strong>{leetcode.hard}</strong>
                <span className="muted">/ {leetcode.totalHard}</span>
              </div>
              <div className="lc-stat-card">
                <span className="lc-stat-label">Global rank</span>
                <strong>{leetcode.ranking?.toLocaleString() ?? "—"}</strong>
                {leetcode.contestRating != null && (
                  <span className="muted">contest {leetcode.contestRating}</span>
                )}
              </div>
              <div className="lc-stat-card">
                <span className="lc-stat-label">Weighted</span>
                <strong>{leetcode.weighted}</strong>
                <span className="muted">E×1 + M×2 + H×4</span>
              </div>
            </div>

            <LeetcodeHeatmap calendar={leetcode.submissionCalendar ?? {}} days={730} />

            {leetcode.badges && leetcode.badges.length > 0 && (
              <div className="lc-badges-section">
                <h3 className="lc-section-title" style={{ fontSize: "1.1rem", marginTop: 24 }}>
                  Badges <span className="muted">· {leetcode.badges.length}</span>
                </h3>
                <LeetcodeBadges badges={leetcode.badges} variant="full" />
              </div>
            )}
          </section>
        )}

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
