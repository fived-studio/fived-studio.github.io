import type { LeetcodeBadge } from "~/lib/api";

const CATEGORY_LABEL: Record<string, string> = {
  ANNUAL: "Annual",
  SUBMISSION: "Submission",
  DCC: "Daily Challenge",
  CONTEST: "Contest",
  STUDYPLAN: "Study Plan",
  COMPETITION: "Competition",
  COMPANY: "Company",
};

type Props = {
  badges: LeetcodeBadge[] | null | undefined;
  /** "compact" = single row of icons, no labels (for leaderboard cards). "full" = grouped by category with names + dates (for member page). */
  variant?: "compact" | "full";
  limit?: number;
};

export default function LeetcodeBadges({ badges, variant = "compact", limit }: Props) {
  if (!badges || badges.length === 0) return null;

  const sorted = [...badges].sort((a, b) =>
    (b.creationDate ?? "").localeCompare(a.creationDate ?? ""),
  );

  if (variant === "compact") {
    const list = limit != null ? sorted.slice(0, limit) : sorted;
    const hidden = limit != null ? Math.max(0, sorted.length - limit) : 0;
    return (
      <div className="lc-badges-compact-wrap">
        <h4 className="lc-badges-compact-title">
          Badges <span className="muted">· {sorted.length}</span>
        </h4>
        <div className="lc-badges" aria-label={`${sorted.length} badges`}>
          {list.map((b) => (
            <span key={b.id} className="lc-badge" title={`${b.name} · ${b.creationDate}`}>
              <img src={b.icon} alt={b.name} loading="lazy" />
            </span>
          ))}
          {hidden > 0 && <span className="lc-badge-more">+{hidden}</span>}
        </div>
      </div>
    );
  }

  // full: group by category, newest first within each group
  const groups = new Map<string, LeetcodeBadge[]>();
  for (const b of sorted) {
    const key = b.category || "OTHER";
    const list = groups.get(key) ?? [];
    list.push(b);
    groups.set(key, list);
  }
  const order = ["ANNUAL", "SUBMISSION", "DCC", "CONTEST", "STUDYPLAN", "COMPETITION", "COMPANY"];
  const orderedKeys = [
    ...order.filter((k) => groups.has(k)),
    ...[...groups.keys()].filter((k) => !order.includes(k)),
  ];

  return (
    <div className="lc-badges-full">
      {orderedKeys.map((cat) => (
        <div key={cat} className="lc-badge-group">
          <h4 className="lc-badge-group-title">
            {CATEGORY_LABEL[cat] ?? cat.charAt(0) + cat.slice(1).toLowerCase()}
            <span className="muted"> · {groups.get(cat)!.length}</span>
          </h4>
          <div className="lc-badges">
            {groups.get(cat)!.map((b) => (
              <span key={b.id} className="lc-badge lc-badge-tile" title={`${b.name} · ${b.creationDate}`}>
                <img src={b.icon} alt={b.name} loading="lazy" />
                <span className="lc-badge-name">{b.name}</span>
                <span className="lc-badge-date">{b.creationDate}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
