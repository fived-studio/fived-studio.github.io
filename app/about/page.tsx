import Link from "next/link";
import SiteHeader from "~/components/SiteHeader";

export const metadata = {
  title: "About Pulse · FiveD Studio",
  description:
    "How FiveD Pulse turns the studio's GitHub footprint into a live engineering signal.",
};

export const dynamic = "force-static";

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="section about-section">
          <header className="section-head">
            <span className="eyebrow">
              <span className="dot" />
              About Pulse
            </span>
            <h1 className="about-title">
              Live engineering signal — <span className="accent">in one place</span>.
            </h1>
            <p className="lede">
              Pulse is the live-pulse backend for FiveD Studio. It listens to GitHub, normalizes
              every push, PR, review, and release the team makes, and broadcasts the signal to
              this site as it happens.
            </p>
          </header>

          <div className="about-grid">
            <div className="about-card">
              <h3>What it ingests</h3>
              <p>
                Two streams: webhooks from the GitHub App installed on the FiveD org, and a 60s
                polling worker that pulls each member's public events from the rest of GitHub.
                Whether you push to a studio repo or your own side project, Pulse sees it.
              </p>
            </div>
            <div className="about-card">
              <h3>How it stays live</h3>
              <p>
                Every accepted event hits a Redis stream which fans out to every browser tab
                subscribed to the SSE endpoint. Open <Link href="/live/">/live</Link>, push a
                commit, watch it appear within ~1 second.
              </p>
            </div>
            <div className="about-card">
              <h3>What it doesn't do</h3>
              <p>
                No comparison features, no leaderboards, no AI judgment. The data is descriptive,
                not evaluative. Members own their visibility — paused, weekend-hidden, latenight-hidden,
                private-repo-hidden — toggleable per person.
              </p>
            </div>
            <div className="about-card">
              <h3>Open by default</h3>
              <p>
                Backend is open source at{" "}
                <a
                  href="https://github.com/fived-studio/pulse"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fived-studio/pulse
                </a>
                . Same for this site at{" "}
                <a
                  href="https://github.com/fived-studio/fived-studio.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  fived-studio/fived-studio.github.io
                </a>
                . The whole pipeline, top to bottom.
              </p>
            </div>
          </div>

          <div className="about-stack">
            <h3>Built with</h3>
            <ul>
              <li>
                <strong>Bun + Hono</strong> on Google Cloud Run
              </li>
              <li>
                <strong>Postgres 16</strong> (Cloud SQL) for events, repos, members, daily rollups
              </li>
              <li>
                <strong>Redis 7</strong> (Memorystore) as a fan-out stream + dedup buffer
              </li>
              <li>
                <strong>GitHub App</strong> for HMAC-verified webhooks; <strong>installation tokens</strong> for the polling worker
              </li>
              <li>
                <strong>Next.js 15</strong> (static export) on GitHub Pages — every page pre-rendered, with a thin client layer that re-fetches on mount so nothing goes stale
              </li>
              <li>
                <strong>Cloud Build trigger</strong> on push-to-main → image → Artifact Registry → Cloud Run revision, ~2min cycle
              </li>
            </ul>
          </div>

          <div className="cta-row center" style={{ marginTop: 56 }}>
            <Link className="btn btn-primary" href="/live/">
              See it live →
            </Link>
            <a
              className="btn btn-ghost"
              href="https://github.com/fived-studio/pulse"
              target="_blank"
              rel="noopener noreferrer"
            >
              Read the source
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
