"use client";

import { useState } from "react";
import { pulse, type ActivityEvent } from "~/lib/api";
import EventTimeline from "./EventTimeline";

type Props = {
  username: string;
  initialEvents: ActivityEvent[];
  initialNextBefore: string | null;
};

const PAGE = 20;

export default function MemberActivity({
  username,
  initialEvents,
  initialNextBefore,
}: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [nextBefore, setNextBefore] = useState<string | null>(initialNextBefore);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const loadOlder = async () => {
    if (!nextBefore || loading) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await pulse.events(PAGE, username, nextBefore);
      // de-dupe by id, in case of overlap from clock skew
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

  if (events.length === 0) return null;

  return (
    <>
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
