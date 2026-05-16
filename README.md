# landing-page-generator

Public demo. Type a business brief, pick a vibe / layout / personality, get a generated landing page in the browser. Downloadable as a single HTML file.

**Live:** TBD (set after first Vercel deploy)

## How it works

1. **Frontend** (`index.html` + `style.css` + `app.js`) — picker UI, calls `/api/generate`, renders streaming HTML into an iframe.
2. **Vercel Edge function** (`api/generate.js`) — holds the Anthropic API key, builds the system prompt from the three style axes, streams the response back to the browser.
3. **Images** — Claude inserts `picsum.photos` URLs with seeded random photos so each page gets unique-feeling visuals without an image API.

## Deploy

### First time (Vercel web UI, ~2 min)
1. Go to https://vercel.com/new
2. Import this repo (`ultrawinning/landing-page-generator`)
3. Framework preset: **Other** (Vercel auto-detects static + Edge function)
4. Add env var: `ANTHROPIC_API_KEY` = your key
5. Click **Deploy**

Vercel auto-deploys on every push to main thereafter.

### Local dev
```sh
cd /Users/emil/Code/landing-page-generator
npx vercel@latest dev
```

Frontend + function at http://localhost:3000. Reads `ANTHROPIC_API_KEY` from `.env.local` (gitignored).

## Structure
- `index.html` / `style.css` / `app.js` — frontend
- `api/generate.js` — Vercel Edge function (Anthropic proxy + style prompt assembly)
- `lib/styles.js` — single source of truth for the 9 style descriptors
- `lib/prompts.js` — prompt builders
- `vercel.json` — Vercel config
- `mini-pathfinder/` — per-project knowledge catalog
