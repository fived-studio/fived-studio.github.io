import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "~/components/SiteHeader";

// TODO(pulse): once the Pulse API is live, fetch real data via
// `pulse.member(username)` from `~/lib/api`. Until then this page renders a
// static profile pulled from MEMBERS + GitHub's avatar URL convention.
const MEMBERS = {
  hgbaooo: { name: "Huỳnh Gia Bảo", role: "Fullstack Engineer" },
  nquynqthanq: { name: "Nguyễn Quốc Thắng", role: "Frontend · UI/UX" },
  thvnhtai: { name: "Nguyễn Thành Tài", role: "Frontend · UI/UX" },
  sloweyyy: { name: "Trương Lê Vĩnh Phúc", role: "Product · DevOps · Fullstack" },
  TrTueTah: { name: "Trần Tuệ Tánh", role: "Fullstack Engineer" },
} as const;

type Username = keyof typeof MEMBERS;

export function generateStaticParams() {
  return Object.keys(MEMBERS).map((username) => ({ username }));
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!(username in MEMBERS)) notFound();
  const member = MEMBERS[username as Username];

  const badge = `[![${member.name} on FiveD Pulse](https://api.fived.studio/badge/${username}.svg)](https://fived-studio.github.io/m/${username})`;

  return (
    <>
      <SiteHeader />

      <main>
        <section className="section" style={{ paddingTop: 96 }}>
          <div className="member-hero">
            <img
              src={`https://github.com/${username}.png`}
              alt={member.name}
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
                {member.name}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: "0.95rem" }}>
                {member.role} ·{" "}
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

        {/* TODO(pulse): replace this placeholder with real recent activity from
            GET /v1/members/:login/events once Pulse is live. */}
        <section className="section">
          <header className="section-head">
            <h2>Activity</h2>
            <p>
              Soon: every push, PR, review, and release this engineer makes — across the FiveD org
              and every public repo they touch on GitHub.
            </p>
          </header>
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
            <div>Pulse backend not yet deployed.</div>
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
        </section>

        <section className="section">
          <header className="section-head">
            <h2>Embed on your README</h2>
            <p>
              When Pulse is live, paste this badge into your GitHub profile README — it updates
              automatically with your live stats.
            </p>
          </header>
          {/* TODO(pulse): the SVG endpoint at /badge/:login.svg lives in the
              backend but isn't deployed yet. */}
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
