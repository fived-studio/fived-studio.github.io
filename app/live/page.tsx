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
        <section className="section" style={{ paddingTop: 96, textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" />
            Coming soon
          </span>
          <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: 24 }}>
            Watch us ship — soon.
          </h1>
          <p style={{ color: "var(--text-dim)", marginTop: 12, maxWidth: 560, margin: "12px auto 0" }}>
            Pulse — our live activity backend — is being built. When it&rsquo;s up, every push, PR,
            review, and release across the team will land here within seconds of happening on GitHub.
          </p>
          <div className="cta-row center" style={{ marginTop: 32 }}>
            <Link className="btn btn-primary" href="/">← Back to home</Link>
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
            <Link href="/">← Home</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
