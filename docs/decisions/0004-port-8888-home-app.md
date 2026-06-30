# ADR-0004: Port 8888 for home app (dev and container)

- **Status:** Accepted
- **Date:** 2026-06-28
- **Scope:** packages/home

## Context

Vite dev server uses port **8888** (`vite.config.ts`). Early Docker compose mapped `8080:80` while the container sometimes inherited `PORT=8888` from `.env`, causing **connection refused** — Docker forwarded to container port 80 but the app listened on 8888.

## Decision

Use **8888 consistently**:

- Vite dev: `8888`
- Container: `PORT=8888`, app binds `0.0.0.0:8888`
- Compose: `${HOME_BACKEND_PORT:-8888}:8888` (host port configurable; container port fixed at 8888)
- Healthcheck: `http://localhost:8888/api/health`

Do **not** rely on `env_file: .env` to set `PORT` for the home container — set `PORT` explicitly in compose.

## Alternatives considered

- **Container port 80** — conventional for HTTP images but fought dev ergonomics and `.env` leakage
- **Different dev vs prod ports** — confusing; easy to hit wrong URL

## Consequences

**Good:**

- Same URL port locally and on NAS (`:8888`)
- Compose mapping is obvious: host → 8888 → 8888

**Bad / tradeoffs:**

- Non-standard HTTP port on the host (acceptable for homelab)

## Links

- `packages/home/vite.config.ts`
- `docker-compose.unraid.yml` (`nasmono-home`)
- `packages/home/Dockerfile` (`EXPOSE 8888`)
