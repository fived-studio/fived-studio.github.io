import Link from "next/link";
import { notFound } from "next/navigation";
import { pulse, type Member, type ActivityEvent } from "~/lib/api";

const KNOWN_MEMBERS = ["hgbaooo", "nquynqthanq", "thvnhtai", "sloweyyy", "TrTueTah"];

// For static export — pre-render only known members. New members require a rebuild.
export function generateStaticParams() {
  return KNOWN_MEMBERS.map((username) => ({ username }));
}

type Data = (Member & { recentEvents: ActivityEvent[] }) | null;

async function load(username: string): Promise<Data> {
  try {
    return await pulse.member(username);
  } catch {
    return null;
  }
}

export default async function MemberPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  if (!KNOWN_MEMBERS.includes(username)) notFound();

  const member = await load(username);
  const fallback = !member;
  const display = member ?? {
    login: username,
    name: username,
    role: null,
    avatarUrl: `https://github.com/${username}.png`,
    recentEvents: [],
  };

  return (
    <>
      <header className="nav">
        <Link href="/" className="brand">
          <span className="logo">5D</span>
          <span className="brand-name">FiveD Studio</span>
        </Link>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/live">Live</Link>
          <Link href="/wrapped/">Wrapped</Link>
        </nav>
      </header>

      <main>
        <section className="section" style={{ paddingTop: 64 }}>
          <div className="member-hero">
            <img
              src={display.avatarUrl ?? `https://github.com/${username}.png`}
              alt={display.name}
              width={120}
              height={120}
              style={{ borderRadius: "50%", border: "2px solid var(--border-hi)" }}
            />
            <div>
              <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginBottom: 8 }}>
                {display.name}
              </h1>
              <p style={{ color: "var(--text-dim)", fontSize: "1.05rem" }}>
                {display.role ?? "Engineer at FiveD Studio"} ·{" "}
                <a
                  href={`https://github.com/${username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "var(--accent)" }}
                >
                  @{username}
                </a>
              </p>
              {fallback && (
                <p style={{ color: "var(--text-mute)", fontSize: "0.85rem", marginTop: 8 }}>
                  (Showing minimal profile — Pulse API not reachable.)
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="section">
          <header className="section-head">
            <h2>Recent activity</h2>
            <p>Last 20 events across every repo, anywhere on GitHub.</p>
          </header>
          {display.recentEvents.length === 0 ? (
            <p style={{ textAlign: "center", color: "var(--text-mute)" }}>
              No activity ingested yet — connect Pulse and webhooks to populate.
            </p>
          ) : (
            <ul className="event-list">
              {display.recentEvents.map((e) => (
                <li key={e.id}>
                  <span className="event-summary">{e.summary}</span>
                  <time dateTime={e.occurredAt}>{new Date(e.occurredAt).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="section contact">
          <h2>Embed this on your GitHub README</h2>
          <p>Drop this badge into your profile README — it updates live.</p>
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
            {`[![${display.name} on FiveD Pulse](https://api.fived.studio/badge/${username}.svg)](https://fived.studio/m/${username})`}
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
