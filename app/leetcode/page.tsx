import Link from "next/link";
import SiteHeader from "~/components/SiteHeader";
import LeetcodeHeatmap from "~/components/LeetcodeHeatmap";
import { pulse, type LeetcodeLeaderboardEntry, type LeetcodeMemberStats } from "~/lib/api";

export const metadata = {
  title: "LeetCode · FiveD Studio",
  description: "Team LeetCode leaderboard and submission heatmaps for the FiveD Studio engineers.",
};

export const dynamic = "force-static";

export default async function LeetcodePage() {
  const board = await pulse.leetcode.leaderboard("weighted").catch(() => ({
    sort: "weighted",
    count: 0,
    leaderboard: [] as LeetcodeLeaderboardEntry[],
  }));

  // Hydrate per-member calendar in parallel for the heatmaps section.
  const stats = await Promise.all(
    board.leaderboard.map((row) =>
      pulse.leetcode.member(row.login).catch(() => null as LeetcodeMemberStats | null),
    ),
  );

  return (
    <>
      <SiteHeader />

      <main>
        <section className="section" style={{ paddingTop: 96 }}>
          <div className="live-head">
            <span className="eyebrow">
              <span className="dot" />
              LeetCode · self-hosted
            </span>
            <h1>
              Five engineers <span className="accent">grinding problems</span>.
            </h1>
            <p className="lede">
              Profile + contest stats from{" "}
              <a href="https://leetcode.com/" target="_blank" rel="noreferrer">leetcode.com</a>{" "}
              refreshed every six hours by Pulse. Weighted score = easy×1 + medium×2 + hard×4.
            </p>
          </div>

          {board.leaderboard.length === 0 ? (
            <p className="muted" style={{ marginTop: 24 }}>
              No LeetCode handles wired up yet. The Pulse worker will populate this on its next tick.
            </p>
          ) : (
            <div className="lc-leaderboard">
              <div className="lc-leaderboard-head">
                <span>#</span>
                <span>Engineer</span>
                <span className="lc-num">Solved</span>
                <span className="lc-num lc-easy">Easy</span>
                <span className="lc-num lc-medium">Medium</span>
                <span className="lc-num lc-hard">Hard</span>
                <span className="lc-num">Weighted</span>
                <span className="lc-num">Contest</span>
                <span className="lc-num">Streak</span>
              </div>
              {board.leaderboard.map((row) => (
                <Link
                  key={row.login}
                  href={`/m/${row.login}/`}
                  className="lc-leaderboard-row"
                >
                  <span className="lc-rank">{row.rank}</span>
                  <span className="lc-engineer">
                    <img
                      src={row.avatar ?? `https://github.com/${row.login}.png`}
                      alt={row.displayName}
                      width={32}
                      height={32}
                      style={{ borderRadius: "50%" }}
                    />
                    <span>
                      <strong>{row.displayName}</strong>
                      <span className="muted lc-handle">@{row.handle}</span>
                    </span>
                  </span>
                  <span className="lc-num">{row.totalSolved}</span>
                  <span className="lc-num lc-easy">{row.easy}</span>
                  <span className="lc-num lc-medium">{row.medium}</span>
                  <span className="lc-num lc-hard">{row.hard}</span>
                  <span className="lc-num"><strong>{row.weighted}</strong></span>
                  <span className="lc-num">{row.contestRating ?? "—"}</span>
                  <span className="lc-num">{row.streak}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {stats.some(Boolean) && (
          <section className="section" style={{ paddingTop: 0 }}>
            <h2 className="lc-section-title">Submission heatmaps · past year</h2>
            <div className="lc-heatmap-list">
              {stats.filter(Boolean).map((s) => {
                const stat = s!;
                return (
                  <article key={stat.login} className="lc-heatmap-card">
                    <header className="lc-heatmap-cardhead">
                      <img
                        src={stat.avatar ?? `https://github.com/${stat.login}.png`}
                        alt={stat.displayName}
                        width={40}
                        height={40}
                        style={{ borderRadius: "50%" }}
                      />
                      <div>
                        <Link href={`/m/${stat.login}/`}>
                          <strong>{stat.displayName}</strong>
                        </Link>
                        <span className="muted">
                          @{stat.handle} · {stat.totalSolved} solved · rank {stat.ranking?.toLocaleString() ?? "—"}
                        </span>
                      </div>
                    </header>
                    <LeetcodeHeatmap calendar={stat.submissionCalendar ?? {}} />
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
