# Landing Page Generator — Project Instructions

## What this is
Public-facing demo: visitor types a business brief, picks a vibe/layout/personality combo (or rolls 🎲 Random), gets a generated landing page rendered in-browser with downloadable HTML.

**Live:** TBD (set after first Vercel deploy)
**Primary user:** Public — demo for showing friends, brand demo for @UltrawinningAI.

## What this is NOT
- Not a production product. No payment, no auth, no persistence.
- Not connected to hpf-command-center, ultrawinning/share, or any tenant repo.
- Not a dumping ground for patterns that belong in `~/Code/overmind/`.

## Tech stack
- Plain HTML/CSS/JS frontend (`index.html`, `style.css`, `app.js`)
- Vercel Edge function in `api/generate.js` — holds Anthropic API key, streams responses
- Shared style/prompt code in `lib/` (ESM)
- Anthropic Claude Sonnet 4.6 (`claude-sonnet-4-6`) for generation
- picsum.photos for images (seeded URLs, no API key needed)
- Hosted on Vercel; auto-deploys on push to main via GitHub integration

## How to start a session
First read: `mini-pathfinder/INDEX.md` — project knowledge catalog.

## Source of truth
When sources conflict: live codebase > this CLAUDE.md > /docs/ > older notes.

## Pattern migration target
`~/Code/overmind/`. Universal patterns and personal IP land there via the weekly sweep.

## Safety rules (non-negotiable)
1. `ANTHROPIC_API_KEY` lives only in Vercel project env vars. Never in frontend, never in repo.
2. Same-origin (frontend + function on same Vercel domain) — no CORS handling needed.
3. No PII collected. No localStorage. Generated pages live only in the user's browser.
4. Never log brief contents or generated HTML in Vercel observability.

## Operating rules
1. Style descriptors in `lib/styles.js` are the single source of truth. Edit one without touching others.
2. The 3-axis API contract (`vibe` / `layout` / `personality`) is stable. Don't add fields without versioning the endpoint.
3. Read `api/generate.js` before changing the request/response shape — frontend and function share the schema.
4. No backwards-compat shims unless explicitly required.

## Verification
- Local dev: `vercel dev` from repo root (serves frontend + functions at http://localhost:3000)
- End-to-end: push to main, Vercel auto-deploys, hit the live URL

Do not claim done without proving the page actually generates end-to-end.

## Communication
Concise. Truth first. No padding. Flag security/data risks immediately.

## Where to look first in a new session
1. This file
2. `app.js` — frontend logic, picker state, API call
3. `api/generate.js` — Vercel Edge function: validation, Anthropic streaming call
4. `lib/styles.js` — the 9 style descriptors
5. `mini-pathfinder/INDEX.md` — project knowledge catalog

## Folder structure (per rule-26)
- `docs/` — narrative zone: plans, decisions, handoffs
- `integrations/` — per-system technical reference (Anthropic, Vercel). Strict zone — no cross-tenant strings.
- `api/` — Vercel Edge functions
- `lib/` — shared ESM modules (styles, prompts)
- Source code at repo root (`index.html`, `style.css`, `app.js`) — strict zone

## Pre-commit guard (cross-tenant pollution)
`.git/hooks/pre-commit` blocks cross-tenant business names from landing in non-pointer-zone files. Bypass with `git commit --no-verify` only for legit pointer mentions.
