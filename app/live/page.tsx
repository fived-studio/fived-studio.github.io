import Link from "next/link";
import { pulse } from "~/lib/api";
import LiveTicker from "~/components/LiveTicker";

export const metadata = {
  title: "Live · FiveD Studio",
  description: "Real-time engineering activity across the FiveD Studio team.",
};

// Static export: this runs at build time. Initial events are baked into the
// HTML; the LiveTicker client component then opens an SSE connection and
// streams new events into view.
export const dynamic = "force-static";

export default async function LivePage() {
  const [events, totals] = await Promise.all([
    pulse.events(20).then((r) => r.data).catch(() => []),
    pulse.totals(30).catch(() => null),
  ]);

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
        <section className="section" style={{ paddingTop: 96 }}>
          <header className="section-head">
            <span className="eyebrow">
              <span className="dot" />
              Live
            </span>
            <h2 style={{ marginTop: 16 }}>
              Watch us ship — <span className="accent">in real time</span>.
            </h2>
            <p>
              Every push, PR, review, and release across the team — within seconds of happening
              on GitHub. Powered by{" "}
              <a href="https://github.com/fived-studio/pulse" target="_blank" rel="noopener noreferrer">
                Pulse
              </a>
              .
            </p>
          </header>

          {totals ? (
            <div className="stats" style={{ margin: "8px 0 24px" }}>
              <div><strong>{totals.total}</strong><span>events / 30d</span></div>
              <div><strong>{totals.prsMerged}</strong><span>PRs merged</span></div>
              <div><strong>{totals.pushes}</strong><span>pushes</span></div>
              <div><strong>{totals.activeMembers}</strong><span>active</span></div>
            </div>
          ) : null}

          <LiveTicker initial={events} max={20} />

          <div className="code-block" style={{ marginTop: 40 }}>
            <div className="code-block-head">
              <span className="code-block-dots">
                <span /><span /><span />
              </span>
              <span>live ~ /v1/stream/events</span>
            </div>
            <pre>
              <code>
                <span className="prompt">$</span>
                <span className="arg">curl -N {process.env.NEXT_PUBLIC_PULSE_API}/v1/stream/events</span>
                {"\n"}
                <span className="comment"># SSE stream — every git event from the studio, live</span>
                {"\n"}
              </code>
            </pre>
          </div>

          <div className="cta-row center" style={{ marginTop: 40 }}>
            <Link className="btn btn-primary" href="/">← Back to studio</Link>
            <a className="btn btn-ghost" href="https://github.com/fived-studio" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
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
