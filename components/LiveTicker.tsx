"use client";

import { useEffect, useRef, useState } from "react";
import { pulse, type ActivityEvent } from "~/lib/api";

type Props = {
  initial: ActivityEvent[];
  member?: string;
  max?: number;
};

export default function LiveTicker({ initial, member, max = 5 }: Props) {
  const [events, setEvents] = useState<ActivityEvent[]>(initial.slice(0, max));
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(pulse.streamUrl(member));
    esRef.current = es;

    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("ping", () => setConnected(true));
    es.addEventListener("pulse.event", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as Omit<ActivityEvent, "id"> & {
          id: string;
        };
        setEvents((prev) => [
          {
            id: data.id,
            type: data.type,
            summary: data.summary,
            occurredAt: data.occurredAt,
          },
          ...prev,
        ].slice(0, max));
      } catch {}
    });
    es.onerror = () => setConnected(false);

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [member, max]);

  if (events.length === 0) {
    return (
      <div className="ticker">
        <span className={`ticker-dot ${connected ? "live" : ""}`} aria-hidden />
        <span className="ticker-empty">Quiet right now. Events will land here as they happen.</span>
      </div>
    );
  }

  return (
    <div className="ticker">
      <span className={`ticker-dot ${connected ? "live" : ""}`} aria-hidden />
      <ul className="ticker-list">
        {events.map((e) => (
          <li key={e.id}>
            <span className="ticker-summary">{e.summary}</span>
            <time dateTime={e.occurredAt} className="ticker-time">
              {relative(e.occurredAt)}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}

function relative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.round(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
