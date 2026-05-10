/**
 * LeetCode-style submission heatmap — past 365 days ending today.
 *
 * Server-rendered SVG. Calendar input is the raw map from LeetCode's
 * userCalendar.submissionCalendar (UNIX-seconds string keys → submission
 * count). We render 7 rows × ~53 columns; opacity scales with intensity.
 */

const CELL = 12;
const GAP = 3;
const ROWS = 7;
const MONTH_LABEL_H = 18;

function windowText(days: number, override?: string): string {
  if (override) return override;
  if (days < 365) return `${days} days`;
  const years = Math.round(days / 365);
  if (years === 1) return "year";
  return `${years} years`;
}

type Props = {
  calendar: Record<string, number>;
  endDate?: Date; // defaults to today
  /** How many days back from endDate to render. Defaults to 365 (1 year). */
  days?: number;
  /** Override the header copy when rendering a window other than 1 year. */
  windowLabel?: string;
};

export default function LeetcodeHeatmap({ calendar, endDate, days: daysWindow = 365, windowLabel }: Props) {
  const end = endDate ?? new Date();
  // anchor end at UTC midnight so cell keys line up with LeetCode's own keys
  const today = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));

  // Build an ordered list of cells ending today, snapped to clean
  // Sunday-start weeks for the column layout.
  const days: Array<{ date: Date; count: number }> = [];
  const totalDays = daysWindow;
  // Walk back 365 days, then snap forward so the first day is a Sunday.
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - (totalDays - 1));
  // Snap start back to the prior Sunday so columns are clean weeks.
  const startWeekday = start.getUTCDay(); // 0=Sun..6=Sat
  start.setUTCDate(start.getUTCDate() - startWeekday);

  // Build until we're past today (inclusive)
  for (let d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    const epoch = Math.floor(d.getTime() / 1000).toString();
    const count = calendar[epoch] ?? 0;
    days.push({ date: new Date(d), count });
  }

  // Pad to a clean grid (multiple of 7) — append future days as zero so the
  // last column always has 7 rows. They render but fall in the future-mask.
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1]!.date;
    const next = new Date(last);
    next.setUTCDate(next.getUTCDate() + 1);
    days.push({ date: next, count: 0 });
  }

  const weeks = days.length / 7;
  const width = weeks * (CELL + GAP);
  const height = ROWS * (CELL + GAP) + MONTH_LABEL_H;

  // Stats: totals over the visible window, only counting cells <= today
  const visible = days.filter((d) => d.date <= today);
  const totalSubmissions = visible.reduce((sum, d) => sum + d.count, 0);
  const activeDays = visible.filter((d) => d.count > 0).length;
  const maxStreak = (() => {
    let best = 0;
    let cur = 0;
    for (const d of visible) {
      if (d.count > 0) {
        cur += 1;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }
    return best;
  })();

  // Intensity scale: 0, 1, 2-3, 4-7, 8+ → alpha 0/0.25/0.5/0.75/1
  const intensity = (n: number): number => {
    if (n <= 0) return 0;
    if (n === 1) return 0.3;
    if (n <= 3) return 0.5;
    if (n <= 7) return 0.75;
    return 1;
  };

  // Month labels — emit a label at the column of the first cell of each month
  const monthLabels: Array<{ x: number; label: string }> = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const firstCell = days[w * 7];
    if (!firstCell) continue;
    const m = firstCell.date.getUTCMonth();
    if (m !== lastMonth) {
      monthLabels.push({
        x: w * (CELL + GAP),
        label: firstCell.date.toLocaleString("en", { month: "short", timeZone: "UTC" }),
      });
      lastMonth = m;
    }
  }

  return (
    <div className="lc-heatmap">
      <div className="lc-heatmap-head">
        <div className="lc-heatmap-stats">
          <strong>{totalSubmissions}</strong> submissions in the past {windowText(daysWindow, windowLabel)}
        </div>
        <div className="lc-heatmap-meta">
          <span>Total active days: <strong>{activeDays}</strong></span>
          <span>Max streak: <strong>{maxStreak}</strong></span>
        </div>
      </div>

      <div className="lc-heatmap-scroll">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-label={`${totalSubmissions} submissions in the past ${windowText(daysWindow, windowLabel)}`}
        >
          {monthLabels.map((m) => (
            <text
              key={`${m.label}-${m.x}`}
              x={m.x}
              y={12}
              fontSize={11}
              fill="var(--text-mute, #8b949e)"
              fontFamily="var(--font-mono)"
            >
              {m.label}
            </text>
          ))}

          {days.map((d, i) => {
            const col = Math.floor(i / 7);
            const row = i % 7;
            const isFuture = d.date > today;
            const a = intensity(d.count);
            const fill =
              isFuture
                ? "transparent"
                : a === 0
                  ? "var(--lc-empty, #1f2024)"
                  : `rgba(0, 217, 146, ${a})`;
            const stroke = a === 0 && !isFuture ? "var(--lc-empty-stroke, #2a2c30)" : "transparent";
            const title = isFuture
              ? d.date.toUTCString()
              : `${d.count} submission${d.count === 1 ? "" : "s"} on ${d.date.toLocaleDateString(
                  "en",
                  { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" },
                )}`;
            return (
              <rect
                key={i}
                x={col * (CELL + GAP)}
                y={MONTH_LABEL_H + row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={fill}
                stroke={stroke}
                strokeWidth={1}
              >
                <title>{title}</title>
              </rect>
            );
          })}
        </svg>
      </div>

      <div className="lc-heatmap-legend">
        <span>Less</span>
        <span className="lc-cell" style={{ background: "var(--lc-empty, #1f2024)" }} />
        <span className="lc-cell" style={{ background: "rgba(0, 217, 146, 0.3)" }} />
        <span className="lc-cell" style={{ background: "rgba(0, 217, 146, 0.5)" }} />
        <span className="lc-cell" style={{ background: "rgba(0, 217, 146, 0.75)" }} />
        <span className="lc-cell" style={{ background: "rgba(0, 217, 146, 1)" }} />
        <span>More</span>
      </div>
    </div>
  );
}
