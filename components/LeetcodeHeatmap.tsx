"use client";

/**
 * LeetCode-style submission heatmap with a year selector.
 *
 * Calendar input is the raw map from LeetCode's
 * userCalendar.submissionCalendar (UNIX-seconds string keys → submission
 * count). The component derives which calendar years exist in the data
 * and renders a "Current ▾" dropdown matching LeetCode's profile UX:
 *   - "Current"  → rolling 365 days ending today
 *   - 2025 / 2024 / ... → that calendar year, Jan 1 → Dec 31
 *
 * Single-year render is always ≤53 weeks wide so the card never overflows.
 */

import { useMemo, useState } from "react";

const CELL = 12;
const GAP = 3;
const ROWS = 7;
const MONTH_LABEL_H = 18;

type View =
  | { kind: "current" }
  | { kind: "year"; year: number };

type Props = {
  calendar: Record<string, number>;
  /** Initial selection. Defaults to "current" (rolling 365 days). */
  initialView?: View;
};

export default function LeetcodeHeatmap({ calendar, initialView }: Props) {
  // Years present in the data, newest first. Derived once per mount.
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const k of Object.keys(calendar)) {
      const ts = Number(k);
      if (!Number.isFinite(ts)) continue;
      set.add(new Date(ts * 1000).getUTCFullYear());
    }
    return [...set].sort((a, b) => b - a);
  }, [calendar]);

  const [view, setView] = useState<View>(initialView ?? { kind: "current" });

  // Compute the day window for the selected view.
  const { rangeStart, rangeEnd, label } = useMemo(() => {
    if (view.kind === "current") {
      const t = new Date();
      const end = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate()));
      const start = new Date(end);
      start.setUTCDate(start.getUTCDate() - 364);
      return { rangeStart: start, rangeEnd: end, label: "past year" };
    }
    const start = new Date(Date.UTC(view.year, 0, 1));
    const end = new Date(Date.UTC(view.year, 11, 31));
    return { rangeStart: start, rangeEnd: end, label: view.year.toString() };
  }, [view]);

  // Build the day grid, snapped to clean Sunday-start weeks.
  const cells = useMemo(() => {
    const arr: Array<{ date: Date; count: number; inRange: boolean }> = [];
    const start = new Date(rangeStart);
    const startWeekday = start.getUTCDay();
    start.setUTCDate(start.getUTCDate() - startWeekday);
    for (let d = new Date(start); d <= rangeEnd; d.setUTCDate(d.getUTCDate() + 1)) {
      const epoch = Math.floor(d.getTime() / 1000).toString();
      arr.push({
        date: new Date(d),
        count: calendar[epoch] ?? 0,
        inRange: d >= rangeStart && d <= rangeEnd,
      });
    }
    while (arr.length % 7 !== 0) {
      const last = arr[arr.length - 1]!.date;
      const next = new Date(last);
      next.setUTCDate(next.getUTCDate() + 1);
      arr.push({ date: next, count: 0, inRange: false });
    }
    return arr;
  }, [calendar, rangeStart, rangeEnd]);

  const weeks = cells.length / 7;
  const width = weeks * (CELL + GAP);
  const height = ROWS * (CELL + GAP) + MONTH_LABEL_H;

  // Stats — only count cells that are actually in the selected range.
  const visible = cells.filter((c) => c.inRange);
  const totalSubmissions = visible.reduce((s, c) => s + c.count, 0);
  const activeDays = visible.filter((c) => c.count > 0).length;
  const maxStreak = (() => {
    let best = 0;
    let cur = 0;
    for (const c of visible) {
      if (c.count > 0) {
        cur += 1;
        if (cur > best) best = cur;
      } else {
        cur = 0;
      }
    }
    return best;
  })();

  const intensity = (n: number): number => {
    if (n <= 0) return 0;
    if (n === 1) return 0.3;
    if (n <= 3) return 0.5;
    if (n <= 7) return 0.75;
    return 1;
  };

  // Month labels at first cell-column of each new month.
  const monthLabels: Array<{ x: number; label: string }> = [];
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    const firstCell = cells[w * 7];
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

  const selectedValue = view.kind === "current" ? "current" : view.year.toString();

  return (
    <div className="lc-heatmap">
      <div className="lc-heatmap-head">
        <div className="lc-heatmap-stats">
          <strong>{totalSubmissions}</strong> submissions in the {label}
        </div>
        <div className="lc-heatmap-meta">
          <span>Total active days: <strong>{activeDays}</strong></span>
          <span>Max streak: <strong>{maxStreak}</strong></span>
          <select
            className="lc-heatmap-year"
            value={selectedValue}
            onChange={(e) => {
              const v = e.target.value;
              setView(v === "current" ? { kind: "current" } : { kind: "year", year: Number(v) });
            }}
            aria-label="Select year"
          >
            <option value="current">Current</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="lc-heatmap-scroll">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          aria-label={`${totalSubmissions} submissions in the ${label}`}
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

          {cells.map((c, i) => {
            const col = Math.floor(i / 7);
            const row = i % 7;
            const a = intensity(c.count);
            const fill =
              !c.inRange
                ? "transparent"
                : a === 0
                  ? "var(--lc-empty, #1f2024)"
                  : `rgba(0, 217, 146, ${a})`;
            const stroke = a === 0 && c.inRange ? "var(--lc-empty-stroke, #2a2c30)" : "transparent";
            const title = !c.inRange
              ? c.date.toUTCString()
              : `${c.count} submission${c.count === 1 ? "" : "s"} on ${c.date.toLocaleDateString(
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
