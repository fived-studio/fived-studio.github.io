import Link from "next/link";
import { notFound } from "next/navigation";

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

  return (
    <>
      <header className="nav">
        <Link href="/" className="brand">
          <span className="logo">5D</span>
          <span className="brand-name">FiveD Studio</span>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/wrapped/">Wrapped</Link>
        </nav>
      </header>

      <main>
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="member-hero">
            <img
              src={`https://github.com/${username}.png`}
              alt={member.name}
              width={120}
              height={120}
              style={{ borderRadius: "50%", border: "2px solid var(--border-hi)" }}
            />
            <div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 8 }}>
                {member.name}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: "1.05rem" }}>
                {member.role} ·{" "}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  @{username}
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* TODO(pulse): replace this placeholder with real recent activity from
            GET /v1/members/:login/events once Pulse is live. The renderer is
            already in place — see the previous commit's version of this file. */}
        <section className="section">
          <header className="section-head">
            <h2>Activity</h2>
            <p>
              Soon: every push, PR, review, and release this engineer makes — across the FiveD org
              and every public repo they touch on GitHub.
            </p>
          </header>
          <p style={{ textAlign: "center", color: "var(--text-mute)", maxWidth: 480, margin: "0 auto" }}>
            Pulse — our live activity backend — is coming online. Until then, see this engineer&rsquo;s
            full footprint on{" "}
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--accent)" }}
            >
              their GitHub profile
            </a>
            .
          </p>
        </section>

        <section className="section contact">
          <h2>Embed this on your GitHub README</h2>
          <p>
            Once Pulse is live, drop this badge into your profile README — it will update
            automatically.
          </p>
          {/* TODO(pulse): the SVG endpoint at /badge/:login.svg lives in the
              backend but isn't deployed yet. Until then, this is a copy-paste
              preview of the future markdown. */}
          <pre
            style={{
              padding: 20,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              maxWidth: 720,
              margin: "20px auto 0",
              fontSize: "0.85rem",
              fontFamily: "JetBrains Mono, monospace",
              color: "var(--text-dim)",
              overflowX: "auto",
            }}
          >
            {`[![${member.name} on FiveD Pulse](https://api.fived.studio/badge/${username}.svg)](https://fived-studio.github.io/m/${username})`}
          </pre>
        </section>
      </main>

      <footer>
        <div className="footer-row">
          <span>© {new Date().getFullYear()} FiveD Studio</span>
          <span>
            <Link href="/">← Home</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
