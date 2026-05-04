<div align="center">

# FiveD Studio

**The public site for [FiveD Studio](https://fived-studio.github.io)** — a small
product studio out of Saigon. Live engineering pulse. Static-fast pages. Streamed
real-time updates.

[![Live site](https://img.shields.io/badge/live-fived--studio.github.io-00d992?style=flat-square)](https://fived-studio.github.io)
[![Pages deploy](https://img.shields.io/github/actions/workflow/status/fived-studio/fived-studio.github.io/deploy.yml?branch=main&style=flat-square&label=deploy)](https://github.com/fived-studio/fived-studio.github.io/actions)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-000?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=fff)](https://www.typescriptlang.org)

</div>

## Highlights

- **Static-first.** Every page pre-renders to HTML at build time — instant first paint, hostable on any CDN.
- **Live where it matters.** `/live` opens a Server-Sent Events stream to the [Pulse backend](https://github.com/fived-studio/pulse) and ticks new events into the feed within seconds of them happening on GitHub.
- **One config switch from prod-grade.** `NEXT_PUBLIC_PULSE_API` is the only environment variable needed; CI plumbs it through automatically.
- **Designed.** Carbon-black canvas, Signal-Green accent, mono-on-system typography. Tokenized in [`app/globals.css`](app/globals.css) — no Tailwind, no CSS-in-JS.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Runtime | Bun |
| Output | `next export` → static `out/` |
| Hosting | GitHub Pages |
| API client | Native `fetch` against the Pulse REST + SSE API |

## Quick start

```bash
bun install
bun run dev
```

Open <http://localhost:3000>. By default the dev server points at a Pulse
backend at `http://localhost:8787`. Override with:

```bash
NEXT_PUBLIC_PULSE_API=https://your-pulse-host bun run dev
```

## Production build

```bash
bun run build       # → ./out/
npx serve out/      # preview the deploy artefact locally
```

## Deploy

CI deploys on every push to `main`. The workflow lives at
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

One-time setup:
1. **Settings → Pages → Source = GitHub Actions**.
2. **Settings → Secrets and variables → Actions → Variables → New variable**
   `PULSE_API_URL` = the deployed Pulse base URL.

That's it. Push to `main`, watch the run, the new build is live ~60 seconds later.

### Custom domain

```bash
echo "fived.studio" > public/CNAME
```

Then point `A` records at GitHub Pages IPs (or a `CNAME` for `www`) and enable
HTTPS in Settings → Pages.

## Project layout

```
app/                          # Next.js App Router
  page.tsx                    # /         home (hero, products, principles, team)
  live/page.tsx               # /live     real-time activity stream
  wrapped/page.tsx            # /wrapped  quarterly archive (placeholder)
  m/[username]/page.tsx       # /m/{login} per-member portfolio
components/
  SiteHeader.tsx              # shared nav
  LiveTicker.tsx              # SSE client — streams pulse.event into a feed
  LiveStats.tsx               # client-polled totals so static stats stay fresh
lib/
  api.ts                      # Pulse REST + SSE client (BASE = NEXT_PUBLIC_PULSE_API)
.github/workflows/deploy.yml  # CI → Pages
```

## Adding a team member

1. Add the GitHub login + display name + role to `ROSTER` in `app/m/[username]/page.tsx`
   (Next needs it at build time for `generateStaticParams`).
2. Add the same row to `FALLBACK_MEMBERS` in `app/page.tsx` (used when the
   API is unreachable at build time).
3. Onboard them in Pulse — once they show up in `/v1/members`, both pages
   prefer the live data.

## Pulse API surface

This site consumes these read endpoints. Full contract in the
[Pulse repository](https://github.com/fived-studio/pulse).

| Method | Path | Used by |
|---|---|---|
| `GET` | `/v1/members` | `/`, `/m/[username]` (resolve display name + avatar) |
| `GET` | `/v1/members/:login` | `/m/[username]` (recent events) |
| `GET` | `/v1/events?member=&limit=` | `/m/[username]`, `/live` (initial fill) |
| `GET` | `/v1/totals?days=` | `/`, `/live` (stats grid) |
| `GET` | `/v1/stream/events` (SSE) | `/live` (live tick) |

`lib/api.ts` is the only file that consumes the API; type changes start there.

## License

Proprietary. © FiveD Studio.
