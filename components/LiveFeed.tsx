"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { pulse, type ActivityEvent, type Member } from "~/lib/api";
import LiveTicker from "./LiveTicker";

type Props = {
  initialEvents: ActivityEvent[];
  members: Member[];
  privateCandidates: string[];
  secretHash: string;
};

export default function LiveFeed({ initialEvents, members, privateCandidates, secretHash }: Props) {
  const [filter, setFilter] = useState<string | null>(null);
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [refreshing, setRefreshing] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [secretInput, setSecretInput] = useState("");
  const [secretError, setSecretError] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);
  const secretInputRef = useRef<HTMLInputElement>(null);
  // Rehydrate from the API on mount: the page is statically exported, so the
  // build-time snapshot can be empty if /v1/members flaked during CI.
  const [liveMembers, setLiveMembers] = useState<Member[]>(members);

  useEffect(() => {
    let cancelled = false;
    pulse
      .members()
      .then((rows) => {
        if (!cancelled && rows.length > 0) setLiveMembers(rows);
      })
      .catch(() => {
        /* keep build-time members */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hasSecret = secretHash.trim().length > 0;
  const privateSet = hasSecret ? new Set(privateCandidates) : new Set<string>();
  const publicMembers = liveMembers.filter((m) => !privateSet.has(m.login));
  const privateMembers = liveMembers.filter((m) => privateSet.has(m.login));
  const visibleMembers = showPrivate ? liveMembers : publicMembers;

  const openSecretModal = () => {
    setSecretError("");
    setSecretInput("");
    setIsUnlocking(false);
    setIsModalOpen(true);
  };

  const closeSecretModal = () => {
    setIsModalOpen(false);
    setSecretError("");
    setSecretInput("");
    setIsUnlocking(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;
    const id = window.setTimeout(() => {
      secretInputRef.current?.focus();
    }, 100);
    return () => window.clearTimeout(id);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSecretModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isModalOpen]);

  const unlockPrivateCandidates = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setIsUnlocking(true);
      const inputHash = await sha256(secretInput);
      if (inputHash !== secretHash) {
        setSecretError("Invalid secret key.");
        setIsUnlocking(false);
        return;
      }
      setShowPrivate(true);
      closeSecretModal();
    } catch {
      setSecretError("Unable to verify key.");
      setIsUnlocking(false);
    }
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
            <span aria-hidden="true">✕</span>
            <span className="live-sr-only">Reveal private candidates</span>
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
        <div className="live-secret-modal-backdrop" onClick={closeSecretModal}>
          <div
            className="live-secret-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="live-secret-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="live-secret-head">
              <h3 id="live-secret-title">Unlock private candidates</h3>
              <button
                type="button"
                className="live-secret-close"
                onClick={closeSecretModal}
                aria-label="Close secret key modal"
              >
                ×
              </button>
            </div>
            <p>Enter the secret key to reveal hidden candidates.</p>
            <form onSubmit={unlockPrivateCandidates}>
              <input
                type="password"
                ref={secretInputRef}
                value={secretInput}
                onChange={(event) => setSecretInput(event.target.value)}
                placeholder="Secret key"
              />
              {secretError && <p className="live-secret-error">{secretError}</p>}
              <div className="live-secret-actions">
                <button type="button" className="live-filter" onClick={closeSecretModal}>
                  Cancel
                </button>
                <button type="submit" className="live-filter is-active" disabled={isUnlocking}>
                  {isUnlocking ? "Checking..." : "Reveal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

async function sha256(value: string): Promise<string> {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
