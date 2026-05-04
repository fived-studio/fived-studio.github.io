import type { ActivityEvent } from "~/lib/api";

type Props = {
  events: ActivityEvent[];
};

/**
 * Groups a flat event list by calendar day in the viewer's local-ish bucket
 * (UTC date — fine for our purposes; precise local-day grouping would need
 * a client component). Each day gets a header with a friendly label and
 * total count; events under it lose redundant timestamp prefixes and just
 * show "HH:MM".
 */
export default function EventTimeline({ events }: Props) {
  const groups = groupByDay(events);

  return (
    <div className="timeline">
      {groups.map((g) => (
        <section key={g.day} className="timeline-day">
          <header className="timeline-day-head">
            <span className="timeline-day-label">{g.label}</span>
            <span className="timeline-day-count">
              {g.events.length} {g.events.length === 1 ? "event" : "events"}
            </span>
          </header>
          <ul className="timeline-list">
            {g.events.map((e) => (
              <li key={e.id}>
                <time dateTime={e.occurredAt} className="timeline-time">
                  {hhmm(e.occurredAt)}
                </time>
                <span className="timeline-summary">{e.summary}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function groupByDay(events: ActivityEvent[]) {
  const buckets = new Map<string, ActivityEvent[]>();
  for (const e of events) {
    const day = e.occurredAt.slice(0, 10);
    const list = buckets.get(day);
    if (list) list.push(e);
    else buckets.set(day, [e]);
  }
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  return Array.from(buckets.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, evs]) => ({
      day,
      label: dayLabel(day, today, yesterday),
      events: evs,
    }));
}

function dayLabel(day: string, today: string, yesterday: string): string {
  if (day === today) return "Today";
  if (day === yesterday) return "Yesterday";
  const d = new Date(day);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function hhmm(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
