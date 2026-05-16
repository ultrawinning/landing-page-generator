# Landing Page Generator — Project Instructions

## What this is
Public-facing demo: visitor types a business brief, picks a vibe/layout/personality combo (or rolls 🎲 Random), gets a generated landing page rendered in-browser with downloadable HTML.

**Live:** TBD (set after first GH Pages deploy)
**Primary user:** Public — demo for showing friends, brand demo for @UltrawinningAI.

## What this is NOT
- Not a production product. No payment, no auth, no persistence.
- Not connected to hpf-command-center, ultrawinning/share, or any tenant repo.
- Not a dumping ground for patterns that belong in `~/Code/overmind/`.

## Tech stack
- Plain HTML/CSS/JS frontend, deployed to GitHub Pages via Actions
- Cloudflare Worker proxy in `worker/` — holds Anthropic API key, streams responses
- Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) for generation
- picsum.photos for images (seeded URLs, no API key needed)

## How to start a session
First read: `mini-pathfinder/INDEX.md` — project knowledge catalog.

## Source of truth
When sources conflict: live codebase > this CLAUDE.md > /docs/ > older notes.

## Pattern migration target
`~/Code/overmind/`. Universal patterns and personal IP land there via the weekly sweep.

## Safety rules (non-negotiable)
1. `ANTHROPIC_API_KEY` lives only in Worker secrets (`wrangler secret put`). Never in frontend, never in repo.
2. CORS is `*` on the Worker — fine for a public demo. If abuse becomes real, scope to GH Pages origin.
3. No PII collected. No localStorage. Generated pages live only in the user's browser.
4. Never log brief contents or generated HTML in Worker observability.

## Operating rules
1. Style descriptors in `worker/src/styles.ts` are the single source of truth. Edit one without touching others.
2. The 3-axis API contract (`vibe` / `layout` / `personality`) is stable. Don't add fields without versioning the Worker endpoint.
3. Read `worker/src/index.ts` before changing the request/response shape — frontend and Worker share the schema.
4. No backwards-compat shims unless explicitly required.

## Verification
- Frontend: open `index.html` in a browser, or `npx serve .` for a local server
- Worker: `cd worker && npx wrangler@latest dev`
- End-to-end: deploy Worker, update `WORKER_URL` in `app.js`, push, hit the live Pages URL

Do not claim done without proving the page actually generates end-to-end.

## Communication
Concise. Truth first. No padding. Flag security/data risks immediately.

## Where to look first in a new session
1. This file
2. `app.js` — frontend logic, picker state, Worker call
3. `worker/src/index.ts` — Worker entrypoint, CORS, validation, Anthropic call
4. `worker/src/styles.ts` — the 9 style descriptors
5. `mini-pathfinder/INDEX.md` — project knowledge catalog

## Folder structure (per rule-26)
- `docs/` — narrative zone: plans, decisions, handoffs
- `integrations/` — per-system technical reference (Anthropic, Cloudflare Workers, GitHub Pages). Strict zone — no cross-tenant strings.
- `worker/` — Cloudflare Worker source (separate Wrangler project)
- Source code at repo root (`index.html`, `style.css`, `app.js`) — strict zone

## Pre-commit guard (cross-tenant pollution)
`.git/hooks/pre-commit` blocks cross-tenant business names from landing in non-pointer-zone files. Bypass with `git commit --no-verify` only for legit pointer mentions.
