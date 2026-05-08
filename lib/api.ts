/**
 * Pulse API client.
 *
 * BASE comes from NEXT_PUBLIC_PULSE_API at build time. CI supplies it from
 * the PULSE_API_URL repo variable; local dev falls back to localhost.
 * Live updates come from the SSE endpoint, opened by client components.
 */

const BASE = process.env.NEXT_PUBLIC_PULSE_API ?? "http://localhost:8787";

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
  events: (limit = 50, member?: string, before?: string) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (member) params.set("member", member);
    if (before) params.set("before", before);
    return get<{ data: ActivityEvent[]; nextBefore: string | null }>(`/v1/events?${params}`);
  },
  totals: (days = 30, member?: string) => {
    const params = new URLSearchParams({ days: String(days) });
    if (member) params.set("member", member);
    return get<{ data: Totals }>(`/v1/totals?${params}`).then((r) => r.data);
  },
  streamUrl: (member?: string) =>
    `${BASE}/v1/stream/events${member ? `?member=${encodeURIComponent(member)}` : ""}`,
  leetcode: {
    leaderboard: (sort: "weighted" | "total" | "ranking" | "contest" = "weighted") =>
      get<{ data: { sort: string; count: number; leaderboard: LeetcodeLeaderboardEntry[] } }>(
        `/v1/leetcode/leaderboard?sort=${sort}`,
      ).then((r) => r.data),
    member: (login: string) =>
      get<{ data: LeetcodeMemberStats }>(`/v1/leetcode/${login}`).then((r) => r.data),
  },
};

export type LeetcodeLeaderboardEntry = {
  rank: number;
  login: string;
  displayName: string;
  avatar: string | null;
  handle: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number | null;
  contestRating: number | null;
  contestAttended: number;
  streak: number;
  totalActiveDays: number;
  weighted: number;
  fetchedAt: string;
  lastError: string | null;
};

export type LeetcodeMemberStats = {
  login: string;
  displayName: string;
  avatar: string | null;
  handle: string;
  totalSolved: number;
  easy: number;
  medium: number;
  hard: number;
  totalEasy: number;
  totalMedium: number;
  totalHard: number;
  ranking: number | null;
  reputation: number;
  contestRating: number | null;
  contestGlobalRanking: number | null;
  contestAttended: number;
  streak: number;
  totalActiveDays: number;
  submissionCalendar: Record<string, number>;
  languageStats: Array<{ languageName: string; problemsSolved: number }>;
  weighted: number;
  fetchedAt: string;
  lastError: string | null;
};
