import Link from "next/link";
import LiveTicker from "~/components/LiveTicker";
import { pulse, type ActivityEvent, type Member, type Totals } from "~/lib/api";

const FALLBACK_MEMBERS: Member[] = [
  { login: "hgbaooo", name: "Huỳnh Gia Bảo", role: "Fullstack Engineer", avatarUrl: null },
  { login: "nquynqthanq", name: "Nguyễn Quốc Thắng", role: "Frontend · UI/UX", avatarUrl: null },
  { login: "thvnhtai", name: "Nguyễn Thành Tài", role: "Frontend · UI/UX", avatarUrl: null },
  { login: "sloweyyy", name: "Trương Lê Vĩnh Phúc", role: "Product · DevOps · Fullstack", avatarUrl: null },
  { login: "TrTueTah", name: "Trần Tuệ Tánh", role: "Fullstack Engineer", avatarUrl: null },
];

async function loadInitial(): Promise<{
  members: Member[];
  events: ActivityEvent[];
  totals: Totals | null;
}> {
  try {
    const [members, evs, totals] = await Promise.all([
      pulse.members(),
      pulse.events(5).then((r) => r.data),
      pulse.totals(30),
    ]);
    return {
      members: members.length ? members : FALLBACK_MEMBERS,
      events: evs,
      totals,
    };
  } catch {
    return { members: FALLBACK_MEMBERS, events: [], totals: null };
  }
}

export default async function Page() {
  const { members, events, totals } = await loadInitial();

  return (
    <>
      <header className="nav">
        <Link href="/" className="brand">
          <span className="logo">5D</span>
          <span className="brand-name">FiveD Studio</span>
        </Link>
        <nav>
          <Link href="#products">Products</Link>
          <Link href="#principles">How we work</Link>
          <Link href="#team">Team</Link>
          <Link href="/live">Live</Link>
          <Link href="/wrapped/">Wrapped</Link>
          <a className="nav-cta" href="https://github.com/fived-studio" target="_blank" rel="noopener noreferrer">
            GitHub →
          </a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">
            <span className="dot" />
            Currently shipping
          </span>
          <h1>
            Five engineers.
            <br />
            One studio.
            <br />
            <span className="grad">Software that ships.</span>
          </h1>
          <p className="lede">
            A small product studio from Saigon. By day we build platforms at enterprise SaaS
            companies. By night we ship our own products — for coffee shops, resorts, and the
            long tail of internet commerce.
          </p>

          <div style={{ marginTop: 28 }}>
            <LiveTicker initial={events} max={5} />
          </div>

          <div className="cta-row" style={{ marginTop: 28 }}>
            <Link className="btn btn-primary" href="#products">See what we ship</Link>
            <a className="btn btn-ghost" href="https://github.com/fived-studio" target="_blank" rel="noopener noreferrer">
              View on GitHub
            </a>
          </div>

          <div className="stats">
            <div>
              <strong>{totals?.total ?? "—"}</strong>
              <span>events · 30d</span>
            </div>
            <div>
              <strong>{totals?.prsMerged ?? "—"}</strong>
              <span>PRs merged</span>
            </div>
            <div>
              <strong>{totals?.reposTouched ?? members.length}</strong>
              <span>repos touched</span>
            </div>
            <div>
              <strong>{totals?.activeMembers ?? members.length}</strong>
              <span>engineers active</span>
            </div>
          </div>
        </section>

        <section id="products" className="section">
          <header className="section-head">
            <h2>What we&rsquo;re building</h2>
            <p>Real products with real users — not weekend demos.</p>
          </header>

          <div className="cards">
            <a className="card" href="https://github.com/fived-studio/CoffeeShopManagement" target="_blank" rel="noopener noreferrer">
              <div className="card-icon">☕</div>
              <h3>Coffee Shop Management</h3>
              <p>POS, inventory, and order workflow built for independent coffee shops.</p>
              <span className="card-link">CoffeeShopManagement →</span>
            </a>
            <a className="card" href="https://github.com/fived-studio/Enigma-Frontend" target="_blank" rel="noopener noreferrer">
              <div className="card-icon">🧠</div>
              <h3>Enigma</h3>
              <p>AI-assisted dropshipping platform — list products, capture margin, no inventory.</p>
              <span className="card-link">Enigma-Frontend →</span>
            </a>
            <a className="card" href="https://github.com/fived-studio/Enigma-Java" target="_blank" rel="noopener noreferrer">
              <div className="card-icon">⚙️</div>
              <h3>Enigma (Java)</h3>
              <p>Java/Spring services powering Enigma&rsquo;s backend.</p>
              <span className="card-link">Enigma-Java →</span>
            </a>
            <a className="card" href="https://github.com/fived-studio/ResortManagementSystem-BE" target="_blank" rel="noopener noreferrer">
              <div className="card-icon">🏝️</div>
              <h3>Resort Management System</h3>
              <p>Operations platform for resorts — guests, rooms, billing, admin.</p>
              <span className="card-link">RMS-BE →</span>
            </a>
          </div>
        </section>

        <section id="principles" className="section principles">
          <header className="section-head">
            <h2>How we operate</h2>
            <p>The defaults we keep coming back to.</p>
          </header>
          <div className="principles-grid">
            <div>
              <h4>Ship early, iterate honestly</h4>
              <p>Real users beat hypothetical ones. We&rsquo;d rather learn fast than launch perfect.</p>
            </div>
            <div>
              <h4>Boring tech where it counts</h4>
              <p>Postgres, queues, and good tests. Hype goes in side projects, not production.</p>
            </div>
            <div>
              <h4>Product engineering</h4>
              <p>We own outcomes end-to-end — design, code, deploy, on-call.</p>
            </div>
            <div>
              <h4>Craft is the point</h4>
              <p>Pixels, latency, and error messages all leave fingerprints. We sweat them.</p>
            </div>
          </div>
        </section>

        <section id="team" className="section">
          <header className="section-head">
            <h2>The team</h2>
            <p>
              Started as classmates at UIT, VNU-HCM. Now scattered across enterprise SaaS — still
              shipping together.
            </p>
          </header>
          <div className="team-grid">
            {members.map((m) => (
              <Link key={m.login} className="member" href={`/m/${m.login}/`}>
                <img
                  src={m.avatarUrl ?? `https://github.com/${m.login}.png`}
                  alt={m.name}
                  loading="lazy"
                />
                <strong>{m.name}</strong>
                <span>{m.role}</span>
              </Link>
            ))}
          </div>
        </section>

        <section id="contact" className="section contact">
          <h2>Let&rsquo;s build something</h2>
          <p>Found a bug, have an idea, or want to partner up? We read everything.</p>
          <div className="cta-row center">
            <a className="btn btn-primary" href="mailto:hello@fived.studio">hello@fived.studio</a>
            <a className="btn btn-ghost" href="https://github.com/fived-studio" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="footer-row">
          <span>© {new Date().getFullYear()} FiveD Studio</span>
          <span>Made with caffeine in Ho Chi Minh City ☕</span>
        </div>
      </footer>
    </>
  );
}
