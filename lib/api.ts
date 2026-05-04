/**
 * Pulse API client.
 *
 * TODO(pulse): UNUSED in the current MVP — kept as the canonical client for
 * when the backend at api.fived.studio is deployed. See ../../pulse/ for the
 * service implementation. The current pages render static content; this file
 * is here so the wire-up is a one-liner per page when the time comes.
 *
 * Reads will come from `api.fived.studio` (or NEXT_PUBLIC_PULSE_API in dev).
 * Live updates come from the SSE endpoint, opened by client components.
 */

const BASE = process.env.NEXT_PUBLIC_PULSE_API ?? "https://api.fived.studio";

export type Member = {
  login: string;
  name: string;
  role: string | null;
  avatarUrl: string | null;
};

export type ActivityEvent = {
  id: string;
  type: string;
  summary: string;
  occurredAt: string;
  memberId?: string | null;
  memberLogin?: string | null;
  repoId?: string | null;
  repoFullName?: string | null;
};

export type Totals = {
  windowDays: number;
  since: string;
  total: number;
  prsMerged: number;
  prsOpened: number;
  reviews: number;
  pushes: number;
  reposTouched: number;
  activeMembers: number;
};

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  // No-store: pages re-fetch fresh on every navigation. We're a static export,
  // so Next's revalidate hint is ignored — caching belongs to the browser.
  const res = await fetch(`${BASE}${path}`, { cache: "no-store", ...init });
  if (!res.ok) throw new Error(`pulse api ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export const pulse = {
  members: () => get<{ data: Member[] }>("/v1/members").then((r) => r.data),
  member: (login: string) =>
    get<{ data: Member & { recentEvents: ActivityEvent[] } }>(`/v1/members/${login}`).then(
      (r) => r.data,
    ),
  events: (limit = 50, member?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (member) params.set("member", member);
    return get<{ data: ActivityEvent[]; nextBefore: string | null }>(`/v1/events?${params}`);
  },
  totals: (days = 30) =>
    get<{ data: Totals }>(`/v1/totals?days=${days}`).then((r) => r.data),
  streamUrl: (member?: string) =>
    `${BASE}/v1/stream/events${member ? `?member=${encodeURIComponent(member)}` : ""}`,
};
