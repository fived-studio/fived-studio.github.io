# fived-studio.github.io

The public landing page for **FiveD Studio**, served at <https://fived-studio.github.io>.

## Stack

Plain HTML + CSS. No build step, no framework, no JS bundle. Just edit and push.

```
.
├── index.html      # the page
├── styles.css      # all styles
├── favicon.svg     # 5D mark
└── README.md
```

## Develop locally

Open `index.html` directly in a browser, or serve it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

GitHub Pages auto‑publishes from `main`. To enable (one‑time):

1. Push to `main` on this repo.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source = Deploy from a branch**, **Branch = main / (root)**.
4. Save. The site goes live at `https://fived-studio.github.io` within a minute.

(Optional) For a custom domain like `fived.studio`:

1. Add a `CNAME` file at the repo root containing `fived.studio`.
2. Configure DNS at your registrar:
   - `A` records to GitHub Pages IPs (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`)
   - or `CNAME` `www` → `fived-studio.github.io`
3. Enable HTTPS in Settings → Pages.

## Editing tips

- Update the products in `index.html` under `#products` when repos change.
- Team avatars come from `https://github.com/<username>.png` — no asset hosting needed.
- Tweak the gradient palette in `styles.css` (`--accent`, `--accent-2`, `--accent-3`).
