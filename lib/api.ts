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

// In-process cache shared across page renders during the static build.
// Key: full URL. Value: in-flight Promise (for coalescing) and resolved JSON.
// During `bun run dev` and runtime, this is harmless because each fetch
// still happens on first hit. The win is at build time: /leetcode pulls
// every member's calendar, and /m/:login reuses the same data without
// re-hitting Cloud Run.
const _cache = new Map<string, Promise<unknown>>();

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${BASE}${path}`;

  const cached = _cache.get(url);
  if (cached) return cached as Promise<T>;

  const promise = (async () => {
    let lastErr: unknown;
    // 8 attempts with capped exponential backoff (max ~3s wait) — Cloud Run
    // autoscaler occasionally 500s when the build fans many requests.
    for (let i = 0; i < 8; i++) {
      try {
        const res = await fetch(url, { cache: "no-store", ...init });
        if (res.ok) return (await res.json()) as T;
        if (res.status >= 500 || res.status === 429) {
          lastErr = new Error(`pulse api ${path} → ${res.status}`);
        } else {
          throw new Error(`pulse api ${path} → ${res.status}`);
        }
      } catch (err) {
        lastErr = err;
      }
      const delay = Math.min(3000, 300 * 2 ** i) + Math.random() * 250;
      await new Promise((r) => setTimeout(r, delay));
    }
    throw lastErr ?? new Error(`pulse api ${path} → unknown`);
  })();

  _cache.set(url, promise);
  // Drop failed entries so a subsequent retry inside the same build can
  // try again rather than inheriting the rejection forever.
  promise.catch(() => _cache.delete(url));
  return promise as Promise<T>;
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
    /** Bulk: full snapshot (incl. calendar + badges) for every member with a handle. */
    all: () =>
      get<{ data: LeetcodeMemberStats[] }>(`/v1/leetcode/all`).then((r) => r.data),
    member: (login: string) =>
      get<{ data: LeetcodeMemberStats }>(`/v1/leetcode/${login}`).then((r) => r.data),
  },
};

export type LeetcodeBadge = {
  id: string;
  name: string;
  icon: string;
  category: string;
  creationDate: string;
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
  badges: LeetcodeBadge[] | null;
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
  badges: LeetcodeBadge[] | null;
  weighted: number;
  fetchedAt: string;
  lastError: string | null;
};
