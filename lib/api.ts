/**
 * Pulse API client. Reads come from `api.fived.studio` (or local dev override).
 * Live updates come from the SSE endpoint, opened by components that mount on
 * the client.
 *
 * All read methods are safe to call from server components — Next.js will
 * fetch + revalidate per the per-call options.
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
  repoId?: string | null;
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
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate: 30 },
    ...init,
  });
  if (!res.ok) throw new Error(`pulse api ${path} → ${res.status}`);
  return (await res.json()) as T;
}

export const pulse = {
  members: () => get<{ data: Member[] }>("/v1/members").then((r) => r.data),
  member: (login: string) =>
    get<{ data: Member & { recentEvents: ActivityEvent[] } }>(`/v1/members/${login}`).then(
      (r) => r.data,
    ),
  events: (limit = 50) =>
    get<{ data: ActivityEvent[]; nextBefore: string | null }>(`/v1/events?limit=${limit}`),
  totals: (days = 30) =>
    get<{ data: Totals }>(`/v1/totals?days=${days}`).then((r) => r.data),
  streamUrl: (member?: string) =>
    `${BASE}/v1/stream/events${member ? `?member=${encodeURIComponent(member)}` : ""}`,
};
