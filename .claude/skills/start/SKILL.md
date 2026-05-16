---
name: start
description: "One-shot — fill in remaining placeholders in this project's CLAUDE.md. Triggered by /start. Run once after the project's been used a bit and entry points exist."
user-invocable: true
trigger: /start
---

# /start — Fill in CLAUDE.md placeholders

Project-scoped `/start` for landing-page-generator, scaffolded by `/new-project`.

## What it does
Walks through any remaining `TBD` lines in `CLAUDE.md` and fills them in based on what now exists in the repo.

## Process

1. **Read the current `CLAUDE.md`.** Find every `TBD`.

2. **Try to auto-fill from the repo first.** Don't ask Emil what's visible in the code:
   - **"Live: TBD"** → confirm GH Pages URL is reachable, fill in.
   - **"Where to look first"** → already filled in scaffold; refresh if new entrypoints appeared.

3. **Show the diff before writing.** Print proposed changes inline so Emil can confirm or edit.

4. **Write the file.** Then delete this skill's directory: `rm -rf .claude/skills/start/`. One-shot — once filled, it's dead weight.

5. **Confirm done.** Tell Emil what was filled in and that the skill self-removed.
