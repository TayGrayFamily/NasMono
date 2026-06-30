# ADR-0002: Curated app tiles, not pure Docker discovery

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** packages/home

## Context

An earlier LaunchPad auto-listed every Docker container and built launch URLs as `tower:{port}`. After moving to reverse proxies (`jellyfin.tower`, etc.), port-based URLs were wrong. Auto-discovery also surfaced databases and sidecars as “web apps.”

## Decision

**Primary grid:** curated apps from config (`url`, `iconUrl`, `displayName`), joined to Docker state via `containerMatch` regex on container name/image.

**Secondary section:** unmatched containers appear under collapsible “System Services” (`ContainerTile`).

Optional **`probeUrl`** when the launch URL requires auth but a public path exists for health checks (see Pi-hole ADR patterns in home README).

When multiple containers match one app, prefer **running** containers with a **published port** (`mergeLaunchpadApps.ts`).

## Alternatives considered

- **Pure Docker discovery** — cannot express reverse-proxy URLs; noisy tile list
- **Hardcoded TypeScript only** — no Unraid override; rebuild for every change
- **Unraid-only config** — no defaults in repo

## Consequences

**Good:**

- Tiles match how users actually open services
- Docker status still comes from Unraid GraphQL unchanged

**Bad / tradeoffs:**

- Each new service requires a config entry (and usually an icon)
- `containerMatch` must be tuned for compose stacks (see ADR pitfalls in AGENTS.md)

## Links

- Supersedes auto-discovery from commit `782278f` era
- `packages/home/server/mergeLaunchpadApps.ts`
- `packages/home/src/components/lauchpad/AppTile.tsx`
