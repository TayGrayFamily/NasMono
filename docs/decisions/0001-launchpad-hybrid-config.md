# ADR-0001: Hybrid LaunchPad config (repo defaults + Unraid override)

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** packages/home

## Context

The LaunchPad needs a curated list of apps (reverse-proxy URLs, icons, display names) while still showing live Docker status from Unraid. We needed to decide where that config lives: fully in git, fully on the NAS, or both.

## Decision

Use a **hybrid** model:

- **Repo defaults:** `packages/home/config/launchpad.apps.json` — version-controlled, shipped in the Docker image
- **Optional NAS override:** `/mnt/user/appdata/nasmono-home/apps.json` via `LAUNCHPAD_CONFIG_PATH=/config/apps.json`
- **Merge by `id`:** override entries patch defaults; new ids are appended; `"enabled": false` hides an app

Validate both sources with Zod (`launchpadSchema.ts`).

## Alternatives considered

- **Repo only** — requires image rebuild to change URLs or add apps
- **NAS only** — empty dashboard on first deploy; no sensible defaults in git
- **TypeScript config (`LaunchPadConfig.ts`)** — previous approach; required rebuild for any tile change

## Consequences

**Good:**

- Sensible defaults out of the box; quick edits on Unraid without rebuild
- Agents and contributors see canonical config in git

**Bad / tradeoffs:**

- Two sources of truth; merge rules must stay documented
- Override file is not in git unless user backs it up

**Follow-ups:**

- Document schema in `packages/home/README.md` and `launchpad.apps.example.json`

## Links

- `packages/home/server/launchpadConfig.ts`
- `packages/home/config/launchpad.apps.json`
