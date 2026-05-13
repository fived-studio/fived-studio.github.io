"use client";

import { useEffect, useState, type FormEvent } from "react";
import { pulse, type ActivityEvent, type Member } from "~/lib/api";
import LiveTicker from "./LiveTicker";

type Props = {
  initialEvents: ActivityEvent[];
  members: Member[];
};

const PRIVATE_CANDIDATES = new Set(["slowey-katalon"]);
const SECRET_KEY = "fived-live-private";

export default function LiveFeed({ initialEvents, members }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [secretError, setSecretError] = useState("");

  const publicMembers = members.filter((m) => !PRIVATE_CANDIDATES.has(m.login));
  const privateMembers = members.filter((m) => PRIVATE_CANDIDATES.has(m.login));
  const visibleMembers = showPrivate ? members : publicMembers;

  const openSecretModal = () => {
    setSecretError("");
    setSecretInput("");
    setIsModalOpen(true);
  };

  const closeSecretModal = () => {
    setIsModalOpen(false);
    setSecretError("");
    setSecretInput("");
  };

  const unlockPrivateCandidates = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (secretInput.trim() !== SECRET_KEY) {
      setSecretError("Invalid secret key.");
      return;
    }
    setShowPrivate(true);
    closeSecretModal();
  };

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
        {visibleMembers.map((m) => (
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
        {!showPrivate && privateMembers.length > 0 && (
          <button
            type="button"
            className="live-filter live-filter-reveal"
            onClick={openSecretModal}
            aria-label="Reveal private candidates"
            title="Reveal private candidates"
          >
            ✚
          </button>
        )}
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
      {isModalOpen && (
        <div className="live-secret-modal-backdrop" role="presentation" onClick={closeSecretModal}>
          <div
            className="live-secret-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-secret-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 id="live-secret-title">Unlock private candidates</h3>
            <p>Enter the secret key to reveal hidden candidates.</p>
            <form onSubmit={unlockPrivateCandidates}>
              <input
                type="password"
                value={secretInput}
                onChange={(event) => setSecretInput(event.target.value)}
                placeholder="Secret key"
                autoFocus
              />
              {secretError && <p className="live-secret-error">{secretError}</p>}
              <div className="live-secret-actions">
                <button type="button" className="live-filter" onClick={closeSecretModal}>
                  Cancel
                </button>
                <button type="submit" className="live-filter is-active">
                  Reveal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
