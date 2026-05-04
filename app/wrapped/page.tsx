import Link from "next/link";
import SiteHeader from "~/components/SiteHeader";

export const metadata = {
  title: "Wrapped — FiveD Studio",
  description: "Quarterly AI-narrated wraps of FiveD Studio's engineering work.",
};

export default function WrappedArchive() {
  return (
    <>
      <SiteHeader />

      <main>
        <section className="section" style={{ paddingTop: 128, textAlign: "center" }}>
          <span className="eyebrow">
            <span className="dot" />
            Quarterly
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
            FiveD <span className="accent" style={{ color: "var(--accent)" }}>Wrapped</span>
          </h1>
          <p style={{ color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", fontSize: "1rem", lineHeight: 1.65 }}>
            Every quarter, an AI reads everything we shipped and writes the story. Custom titles
            for every engineer, repo highlights, speed records, inside jokes — mined from real
            commit data, narrated, archived forever.
          </p>

          <div className="code-block" style={{ marginTop: 40 }}>
            <div className="code-block-head">
              <span className="code-block-dots">
                <span /><span /><span />
              </span>
              <span>archive ~ /wrapped</span>
            </div>
            <pre>
              <code>
                <span className="prompt">$</span>
                <span className="arg">ls /wrapped/</span>
                {"\n"}
                <span className="comment"># empty. the first wrapped drops at the end of Q3 2026.</span>
                {"\n"}
              </code>
            </pre>
          </div>

          <div className="cta-row center" style={{ marginTop: 40 }}>
            <Link className="btn btn-primary" href="/live">Watch live →</Link>
            <Link className="btn btn-ghost" href="/">← Back to studio</Link>
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
