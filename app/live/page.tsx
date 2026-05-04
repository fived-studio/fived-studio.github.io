import Link from "next/link";
import { pulse } from "~/lib/api";
import LiveTicker from "~/components/LiveTicker";

export const metadata = {
  title: "Live · FiveD Studio",
  description: "Real-time engineering activity across the FiveD Studio team.",
};

export const dynamic = "force-static";

export default async function LivePage() {
  const [eventsRes, totals, members] = await Promise.all([
    pulse.events(20).catch(() => ({ data: [], nextBefore: null })),
    pulse.totals(30).catch(() => null),
    pulse.members().catch(() => []),
  ]);
  const events = eventsRes.data;

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
          <a className="nav-cta" href="https://github.com/fived-studio/pulse" target="_blank" rel="noopener noreferrer">
            pulse →
          </a>
        </nav>
      </header>

      <main>
        <section className="section live-section">
          <div className="live-head">
            <span className="eyebrow">
              <span className="dot" />
              Live · SSE
            </span>
            <h1>
              Watch us ship — <span className="accent">in real time</span>.
            </h1>
            <p className="lede">
              Every push, PR, review, and release across the team — within seconds of happening
              on GitHub. Powered by{" "}
              <a href="https://github.com/fived-studio/pulse" target="_blank" rel="noopener noreferrer">
                Pulse
              </a>
              .
            </p>
          </div>

          <div className="live-stats">
            <div>
              <strong>{totals?.total ?? 0}</strong>
              <span>events / 30d</span>
            </div>
            <div>
              <strong>{totals?.prsMerged ?? 0}</strong>
              <span>PRs merged</span>
            </div>
            <div>
              <strong>{totals?.pushes ?? 0}</strong>
              <span>pushes</span>
            </div>
            <div>
              <strong>{totals?.reviews ?? 0}</strong>
              <span>reviews</span>
            </div>
            <div>
              <strong>{totals?.activeMembers ?? members.length}</strong>
              <span>{totals?.activeMembers ? "active" : "members"}</span>
            </div>
          </div>

          <div className="live-feed">
            <div className="live-feed-head">
              <span className="live-feed-title">Activity feed</span>
              <span className="live-feed-meta">last 20 · auto-updating</span>
            </div>
            <LiveTicker initial={events} max={20} />
          </div>

          <details className="live-curl">
            <summary>Stream it yourself</summary>
            <pre>
              <code>
                <span className="prompt">$</span> curl -N \
                {"\n  "}
                {process.env.NEXT_PUBLIC_PULSE_API}/v1/stream/events
                {"\n"}
                <span className="comment"># SSE — every git event from the studio, live</span>
              </code>
            </pre>
          </details>
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
