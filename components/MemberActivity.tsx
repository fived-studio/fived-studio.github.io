"use client";

import { useEffect, useState } from "react";
import { pulse, type ActivityEvent } from "~/lib/api";
import EventTimeline from "./EventTimeline";

type Props = {
  username: string;
  initialEvents: ActivityEvent[];
  initialNextBefore: string | null;
};

const PAGE = 20;

/**
 * Renders an engineer's recent activity. Build-time props seed the page so
 * the static HTML is non-empty for crawlers, but on mount we always
 * re-fetch and replace — the build can be hours stale or have caught a
 * transient API blip and baked zeros.
 */
export default function MemberActivity({
  username,
  initialEvents,
  initialNextBefore,
}: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [nextBefore, setNextBefore] = useState<string | null>(initialNextBefore);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(initialEvents.length === 0);
  const [err, setErr] = useState<string | null>(null);

  // Always refresh on mount — replaces whatever the build cached
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await pulse.events(PAGE, username);
        if (cancelled) return;
        setEvents(res.data);
        setNextBefore(res.nextBefore);
      } catch {
        // build-cached data stays
      } finally {
        if (!cancelled) setRefreshing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [username]);

  const loadOlder = async () => {
    if (!nextBefore || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await pulse.events(PAGE, username, nextBefore);
      const ids = new Set(events.map((e) => e.id));
      const fresh = res.data.filter((e) => !ids.has(e.id));
      setEvents((cur) => [...cur, ...fresh]);
      setNextBefore(res.nextBefore);
    } catch {
      setErr("couldn't reach the API — try again");
    } finally {
      setLoading(false);
    }
  };

  if (events.length === 0) {
    return (
      <div className="member-empty">
        <div className="member-empty-prompt">$ pulse status</div>
        <div>
          {refreshing
            ? "checking for activity…"
            : `No events tracked yet for @${username}.`}
        </div>
        <div style={{ marginTop: 12 }}>
          See full footprint at{" "}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--accent)" }}
          >
            {`github.com/${username}`}
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="member-activity-meta">
        Last {events.length} {events.length === 1 ? "event" : "events"} from{" "}
        {username} across the FiveD org and personal repos.
        {refreshing ? " · refreshing…" : ""}
      </div>
      <EventTimeline events={events} />
      <div className="load-more">
        {nextBefore ? (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={loadOlder}
            disabled={loading}
          >
            {loading ? "Loading…" : "Load older events"}
          </button>
        ) : (
          <span className="load-more-end">— end of activity —</span>
        )}
        {err ? <p className="load-more-err">{err}</p> : null}
      </div>
    </>
  );
}
