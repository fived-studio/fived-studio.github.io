import Link from "next/link";

export const metadata = {
  title: "Wrapped — FiveD Studio",
  description: "Quarterly AI-narrated wraps of FiveD Studio's engineering work.",
};

export default function WrappedArchive() {
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
        </nav>
      </header>

      <main>
        <section className="section" style={{ paddingTop: 64 }}>
          <header className="section-head">
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>FiveD Wrapped</h1>
            <p style={{ color: "var(--text-dim)", marginTop: 12 }}>
              Every quarter, an AI reads everything we shipped and writes the story.
            </p>
          </header>

          <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
            <p style={{ color: "var(--text-mute)", fontSize: "1rem" }}>
              No Wrappeds published yet. The first one drops at the end of Q3 2026.
            </p>
            <p style={{ color: "var(--text-mute)", fontSize: "0.85rem", marginTop: 32 }}>
              Want a preview? Watch the{" "}
              <Link href="/live" style={{ color: "var(--accent)" }}>
                live feed
              </Link>{" "}
              while we work.
            </p>
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
