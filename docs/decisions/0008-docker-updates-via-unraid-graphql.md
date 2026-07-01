# ADR-0008: Docker image updates via Unraid GraphQL

- **Status:** Accepted
- **Date:** 2026-07-01
- **Scope:** packages/home, docker

## Context

The System → Docker view is read-only today. Operators want one-click image updates from NasMono without opening the Unraid web UI. NasMono already calls Unraid GraphQL for container lists (`UNRAID_API_KEY`). Compose Manager runs the NasMono stack but exposes no stable API-key-authenticated stack-update endpoint.

## Decision

1. **Use Unraid GraphQL Docker mutations** for image updates:
   - `docker.updateContainer(id)`
   - `docker.updateContainers(ids)`
   - `docker.updateAllContainers`
   - `refreshDockerDigests` before checking `isUpdateAvailable`

2. **Expose mutations only when `ADMIN_ACTIONS_ENABLED=true`** (set in `docker-compose.unraid.yml` for production). Fixture/CI runs stay read-only.

3. **System → Docker UI:** per-container menu (Update image, Check for updates), toolbar **Update all outdated**, optional **Update NasMono stack** when `STACK_UPDATE_CONTAINER_MATCH` is set.

4. **Compose stack batch:** match container names via regex env and call `updateContainers` — not Compose Manager's `compose pull + up -d`. Document `COMPOSE_MANAGER_STACK_URL` as fallback.

5. **API key must include Docker write permissions** on Unraid (not read-only).

6. **No auth middleware in v1** — LAN-only per ADR-0007; mutations increase blast radius. Env gate limits accidental exposure in dev/CI.

## Alternatives considered

- **Compose Manager PHP AJAX** — session auth, undocumented, breaks on plugin updates
- **Docker socket mount in nasmono-home** — full stack `compose` control but large security exposure
- **LaunchPad tile update buttons** — deferred; System view is the operator surface

## Consequences

**Good:**

- Official Unraid API; no plugin reverse-engineering
- Works for `web_app` and other containers visible in GraphQL
- Self-update of NasMono from its own UI

**Bad / tradeoffs:**

- `updateContainer` uses Unraid template update script, not compose pull+up
- `isUpdateAvailable` may be unreliable for compose-managed containers
- Updating `web_app` disconnects the dashboard briefly
- Unauthenticated POST on LAN if `ADMIN_ACTIONS_ENABLED=true`

**Follow-ups:**

- Optional `ADMIN_ACTIONS_API_KEY` header if dashboard is ever exposed beyond LAN
- LaunchPad per-tile updates if needed later

## Links

- [docker-compose.unraid.yml](../../docker-compose.unraid.yml)
- [packages/home/server/unraidDockerActions.ts](../../packages/home/server/unraidDockerActions.ts)
- ADR [0007](./0007-game-hub-lobby-first-roadmap.md) (LAN-only)
