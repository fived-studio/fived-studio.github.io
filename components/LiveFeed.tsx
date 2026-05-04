"use client";

import { useEffect, useState } from "react";
import { pulse, type ActivityEvent, type Member } from "~/lib/api";
import LiveTicker from "./LiveTicker";

type Props = {
  initialEvents: ActivityEvent[];
  members: Member[];
};

export default function LiveFeed({ initialEvents, members }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [refreshing, setRefreshing] = useState(false);

  // Re-fetch when the filter chip changes (or on mount with null filter).
  useEffect(() => {
    let cancelled = false;
    setRefreshing(true);
    pulse
      .events(20, filter ?? undefined)
      .then((r) => {
        if (!cancelled) setEvents(r.data);
      })
      .catch(() => {
        /* keep current events */
      })
      .finally(() => {
        if (!cancelled) setRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <>
      <div className="live-filters" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={filter === null}
          className={`live-filter ${filter === null ? "is-active" : ""}`}
          onClick={() => setFilter(null)}
        >
          everyone
        </button>
        {members.map((m) => (
          <button
            key={m.login}
            type="button"
            role="tab"
            aria-selected={filter === m.login}
            className={`live-filter ${filter === m.login ? "is-active" : ""}`}
            onClick={() => setFilter(m.login)}
            title={m.name}
          >
            @{m.login}
          </button>
        ))}
      </div>

      <div className="live-feed">
        <div className="live-feed-head">
          <span className="live-feed-title">Activity feed</span>
          <span className="live-feed-meta">
            {filter ? `filtered: @${filter}` : "everyone"} · last {events.length} ·{" "}
            {refreshing ? "refreshing…" : "live"}
          </span>
        </div>
        <LiveTicker initial={events} member={filter ?? undefined} max={20} />
      </div>
    </>
  );
}
