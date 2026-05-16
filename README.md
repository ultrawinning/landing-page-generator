# landing-page-generator

Public demo. Type a business brief, pick a vibe / layout / personality, get a generated landing page in the browser. Downloadable as a single HTML file.

**Live:** https://ultrawinning.github.io/landing-page-generator/ (after first deploy)

## How it works

1. **Frontend** (`index.html` + `style.css` + `app.js`) — picker UI, calls the Worker, renders streaming HTML into an iframe.
2. **Cloudflare Worker** (`worker/`) — holds the Anthropic API key, builds the system prompt from the three style axes, streams the response back to the browser.
3. **Images** — Claude inserts `picsum.photos` URLs with seeded random photos so each page gets unique-feeling visuals without an image API.

## Setup

### One-time
```sh
cd /Users/emil/Code/landing-page-generator/worker
npx wrangler@latest login
npx wrangler@latest deploy
npx wrangler@latest secret put ANTHROPIC_API_KEY
```

Wrangler prints a URL like `https://landing-page-generator-worker.YOUR-SUBDOMAIN.workers.dev` — paste it into `WORKER_URL` at the top of `app.js`, commit, push. GH Pages auto-deploys on push to main.

### Local dev
```sh
cd /Users/emil/Code/landing-page-generator/worker && npx wrangler@latest dev   # Worker at :8787
cd /Users/emil/Code/landing-page-generator && npx serve .                       # Frontend
```

Set `WORKER_URL` to `http://localhost:8787` during local dev.

## Structure
- `index.html` / `style.css` / `app.js` — frontend
- `worker/` — Cloudflare Worker (Anthropic proxy + style prompt assembly)
- `.github/workflows/deploy.yml` — auto-deploy frontend to GH Pages on push to main
- `mini-pathfinder/` — per-project knowledge catalog
