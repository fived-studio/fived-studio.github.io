import Link from "next/link";
import LiveTicker from "~/components/LiveTicker";
import { pulse, type ActivityEvent } from "~/lib/api";

export const metadata = {
  title: "Live — FiveD Studio",
  description: "Real-time engineering activity across the FiveD Studio team.",
};

async function loadInitial(): Promise<ActivityEvent[]> {
  try {
    const r = await pulse.events(50);
    return r.data;
  } catch {
    return [];
  }
}

export default async function LivePage() {
  const initial = await loadInitial();
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
          <header className="section-head">
            <span className="eyebrow">
              <span className="dot" />
              Live activity
            </span>
            <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", marginTop: 24 }}>
              Watch us ship.
            </h1>
            <p style={{ color: "var(--text-dim)", marginTop: 12 }}>
              Every push, PR, review, and release across the team — live.
            </p>
          </header>

          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <LiveTicker initial={initial} max={50} />
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
