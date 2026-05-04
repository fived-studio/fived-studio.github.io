"use client";

import { useEffect, useState } from "react";
import { pulse, type Totals } from "~/lib/api";

type Props = {
  initial: Totals | null;
  fallbackMembers: number;
};

export default function LiveStats({ initial, fallbackMembers }: Props) {
  const [totals, setTotals] = useState<Totals | null>(initial);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const fresh = await pulse.totals(30);
        if (!cancelled) setTotals(fresh);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="live-stats">
      <div>
        <strong>{totals?.total ?? 0}</strong>
        <span>events / 30d</span>
      </div>
      <div>
        <strong>{totals?.prsMerged ?? 0}</strong>
        <span>PRs merged</span>
      </div>
      <div>
        <strong>{totals?.pushes ?? 0}</strong>
        <span>pushes</span>
      </div>
      <div>
        <strong>{totals?.reviews ?? 0}</strong>
        <span>reviews</span>
      </div>
      <div>
        <strong>{totals?.activeMembers ?? fallbackMembers}</strong>
        <span>{totals?.activeMembers ? "active" : "members"}</span>
      </div>
    </div>
  );
}
