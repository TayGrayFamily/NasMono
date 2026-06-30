# ADR-0006: Minimal Unraid compose env (secrets only)

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** docker

## Context

`nasmono-home` previously used `env_file: .env`, which injected the full dev `.env` (local DB URLs, `PORT=8888` conflicts, Vite vars) into the production container. Compose also duplicated many values as `${VAR}` substitutions.

## Decision

For **`nasmono-home`**:

- **Remove `env_file`** — no bulk `.env` injection
- **Hardcode non-secrets** in `docker-compose.unraid.yml`: `PORT`, `UNRAID_GRAPHQL_URL`, `REACHABILITY_GATEWAY`, `LAUNCHPAD_CONFIG_PATH`, volumes, healthcheck
- **From NAS `.env` only:** `UNRAID_API_KEY` (required), optional `HOME_BACKEND_PORT`

For the **game stack**, keep `${POSTGRES_PASSWORD}` (secret) and hardcode ports (`3001`, `8000`, `5432`).

Local dev continues to use repo-root `.env` via Vite; that file is not mounted into the home container.

## Alternatives considered

- **Full `env_file` on all services** — simple but couples dev and prod config
- **All vars in Unraid UI** — more clicking; no benefit for static values like GraphQL URL

## Consequences

**Good:**

- Production container gets only what it needs
- Fewer “works on Mac, broken on NAS” env surprises

**Bad / tradeoffs:**

- Changing hardcoded URLs (e.g. `tower` hostname) requires editing compose, not `.env`

## Links

- `docker-compose.unraid.yml`
- `.env.example`
