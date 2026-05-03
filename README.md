# fived-studio.github.io

The public site for **FiveD Studio**, served at <https://fived-studio.github.io>
(eventually <https://fived.studio>). Frontend for **FiveD Pulse** — the live
engineering platform aggregating every team member's full GitHub footprint.

## Stack

Next.js 15 (App Router) · React 19 · static export · GitHub Pages.

## MVP status

The site ships **without** any backend dependency — every route renders fully
static content. The Pulse API client (`lib/api.ts`) and `LiveTicker` component
are scaffolded and ready, but currently unused. Files contain `TODO(pulse):`
markers at every wire-up point — `grep -rn "TODO(pulse)" app components lib`
to see them all.

Once the Pulse backend (sibling repo `~/Documents/Code/pulse/`) is deployed,
flipping each `TODO(pulse)` switch turns the static page into a live one.

## Layout

```
.
├── app/
│   ├── layout.tsx                # html shell, fonts, OG metadata
│   ├── page.tsx                  # home (hero, products, principles, team)
│   ├── globals.css               # design tokens + components
│   ├── m/[username]/page.tsx     # /m/{login} — per-member portfolio page
│   ├── live/page.tsx             # /live — full live feed
│   └── wrapped/page.tsx          # /wrapped — quarterly archive (stub)
├── components/
│   └── LiveTicker.tsx            # SSE-driven live activity component
├── lib/
│   └── api.ts                    # Pulse API client
├── public/
│   └── favicon.svg
├── next.config.js                # static export configured here
└── .github/workflows/deploy.yml  # builds + deploys to Pages on push
```

## Develop locally

```bash
pnpm install
pnpm dev
```

Hot reload at http://localhost:3000.

To point at a local Pulse backend (default is `https://api.fived.studio`):

```bash
NEXT_PUBLIC_PULSE_API=http://localhost:8787 pnpm dev
```

## Build & preview the static export

```bash
pnpm build              # outputs to ./out/
npx serve out/          # preview the deploy artifact
```

## Deploy

Pages publishes from a GitHub Actions workflow (not "deploy from a branch"). On
push to `main` the workflow builds `out/` and deploys it.

**One-time switch in repo settings:**

1. Settings → Pages → Source = **GitHub Actions** (was: "Deploy from a branch").
2. Add a repo variable `PULSE_API_URL` if the Pulse API lives somewhere other
   than `https://api.fived.studio`.

## Custom domain

To serve at `fived.studio`:

1. Buy the domain.
2. Add `public/CNAME` containing `fived.studio` (Next.js copies `public/` into
   the build).
3. Configure DNS at your registrar (`A` records to GitHub Pages IPs or `CNAME`
   `www` → `fived-studio.github.io`).
4. Enable HTTPS in Settings → Pages.

## Adding a new team member

1. Add their GitHub login to `KNOWN_MEMBERS` in `app/m/[username]/page.tsx` so
   the static export pre-renders their page.
2. Add them to `FALLBACK_MEMBERS` in `app/page.tsx` so the home page works
   before the Pulse API knows about them.
3. Onboard them in Pulse (OAuth flow → `members` table → optional GitHub App
   install on their personal account). Once they're in Pulse, the API reflects
   them automatically.

## Pulse API contract (read-only, public)

All endpoints listed in [Pulse README](../pulse/README.md). Used by this site:

- `GET /v1/members` — team list
- `GET /v1/members/:login` — single member with recent events
- `GET /v1/events?limit=50` — org-wide event feed
- `GET /v1/totals?days=30` — rollup numbers
- `GET /v1/stream/events` (SSE) — live activity push

If you change the API contract, `lib/api.ts` is the only place that consumes
it on this side.
