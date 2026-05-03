import Link from "next/link";

export const metadata = {
  title: "Live — coming soon · FiveD Studio",
  description: "Real-time engineering activity across the FiveD Studio team. Coming soon.",
};

// TODO(pulse): this page is a deliberate placeholder until the Pulse backend
// is live. The full implementation (LiveTicker w/ SSE) is wired in
// components/LiveTicker.tsx and lib/api.ts — just import and render it here.
export default function LivePage() {
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
        <section className="section" style={{ paddingTop: 128, textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" />
            Coming soon
          </span>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.25rem, 5vw, 3.25rem)",
              fontWeight: 400,
              letterSpacing: "-0.65px",
              lineHeight: 1.05,
              margin: "28px 0 20px",
            }}
          >
            Watch us ship — <span className="accent" style={{ color: "var(--accent)" }}>soon</span>.
          </h1>
          <p style={{ color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", fontSize: "1rem", lineHeight: 1.65 }}>
            Pulse — our live activity backend — is being built. When it&rsquo;s up, every push, PR,
            review, and release across the team will land here within seconds of happening on GitHub.
          </p>

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
                <span className="arg">curl -N https://api.fived.studio/v1/stream/events</span>
                {"\n"}
                <span className="comment"># SSE stream — every git event from the studio, live</span>
                {"\n"}
                <span className="comment"># status: building. ETA: M1 (week 3–4 of the Pulse roadmap)</span>
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
