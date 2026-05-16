# Mini-Pathfinder (per-project catalog)

Lightweight per-project knowledge catalog. Locate context without grepping the whole repo.

## What this is

Filesystem-based, single-source-of-truth catalog of every meaningful knowledge asset in this project — brain files, transcripts, SOPs, archives, external URLs.

Two files do the work:

- **`INDEX.md`** — human + AI readable. Organised by domain. One line per asset. Read this on session start.
- **`manifest.json`** — same data, structured. Query via `./find` or `jq`.

## Quick start

```bash
./mini-pathfinder/find                       # list domains
./mini-pathfinder/find <domain>              # list assets in a domain
./mini-pathfinder/find <domain> <keyword>    # filter within a domain
./mini-pathfinder/find "" <keyword>          # search across all domains
./mini-pathfinder/find --tags                # list tags in use
```

## Adding a new asset

When new content lands, do these in the same commit:

1. Append a row in `INDEX.md` under the right domain
2. Append the entry to `manifest.json` `assets` array

Required fields: `id`, `path`, `type`, `domain`, `tags`, `summary`. Keep summaries to ONE LINE.

## Conventions

- **Domains** are project-defined. Add them under `domains` in `manifest.json` when introducing.
- **Types**: `index`, `brain`, `framework`, `synthesis`, `handover`, `transcript`, `analysis`, `spec`, `template`, `archive`, `external-page`.
- **Tags**: free-form, lowercase, hyphenated.
- **Paths**: relative to project root. External URLs allowed only in the `external` domain.

If an asset supersedes another, tag the older one `superseded` and note the replacement in its summary.

## When *not* to use this

If the project is a one-off script with <10 files, this is overhead. Use it when knowledge accumulates — SOPs, transcripts, multi-source synthesis, archived raw inputs.
