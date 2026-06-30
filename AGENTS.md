# Agent guide

Context for AI agents working in this monorepo. Read this before making changes.

## What this repo is

pnpm workspace (`packages/*`) for homelab web apps deployed on **Unraid**. Primary app: **`packages/home`** — a LaunchPad dashboard that lists curated homelab services with Docker status and HTTP reachability checks.

Other packages: `game-hub`, `game-server` (Socket.IO game lobby; separate stack in compose).

## Key files

| Path                                       | Purpose                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `packages/home/`                           | LaunchPad UI + Express API                                               |
| `packages/home/config/launchpad.apps.json` | Default app tiles (URLs, icons, Docker matchers)                         |
| `packages/home/server/`                    | Express API (`apiRouter.ts`, `reachability.ts`, `mergeLaunchpadApps.ts`) |
| `packages/home/vite.config.ts`             | Dev server port **8888**; mounts API via Vite plugin                     |
| `docker-compose.unraid.yml`                | Unraid Compose Manager stack                                             |
| `.env` / `.env.example`                    | Local dev secrets; minimal `.env` on NAS                                 |

## LaunchPad architecture

```
launchpad.apps.json (repo defaults)
  + optional /config/apps.json on NAS (LAUNCHPAD_CONFIG_PATH)
  → merge by id
  → join Unraid GraphQL containers via containerMatch regex
  → GET /api/launchpad → { apps, otherServices }
  → AppTile (curated) + ContainerTile (unmatched containers)
```

**App config fields:** `id`, `displayName`, `url`, `iconUrl`, `containerMatch`, optional `probeUrl`, optional `enabled: false`.

- **`url`** — browser launch link (often reverse proxy: `http://jellyfin.tower`)
- **`probeUrl`** — optional health-check URL when `url` requires auth (e.g. Pi-hole `/admin` → probe `/api/docs/`)
- **`containerMatch`** — case-insensitive regex on container **name** and **image**; prefer exact patterns (`^Immich$`) on compose stacks with many containers

When multiple containers match, server prefers **running** + **published port** (`mergeLaunchpadApps.ts`).

## Local development

```bash
pnpm install
cp .env.example .env   # add UNRAID_API_KEY, UNRAID_GRAPHQL_URL
pnpm dev:home          # http://localhost:8888
```

- Vite dev port: **8888** (not the Docker host port — same number, different context)
- API routes: `/api/health`, `/api/launchpad`, `/api/containers`, `/api/reachability`
- Env loaded from repo root `.env` (`envDir` in vite.config.ts)

## Unraid deployment

- Compose file: `docker-compose.unraid.yml`
- Image: `ghcr.io/taygrayfamily/nasmono-home:latest` (built by `release-on-merge.yml` as `{owner}/{repo}-home`; repo is **NasMono**)
- Container listens on **8888** inside; host maps `${HOME_BACKEND_PORT:-8888}:8888`
- **Required secret in NAS `.env`:** `UNRAID_API_KEY`
- Hardcoded in compose: `UNRAID_GRAPHQL_URL`, `REACHABILITY_GATEWAY`, `LAUNCHPAD_CONFIG_PATH`, volume mount

Reachability from inside Docker: `*.tower` hostnames often fail DNS. Compose sets `REACHABILITY_GATEWAY=http://host.docker.internal` + `extra_hosts: host-gateway`. Probes try direct → gateway with `Host:` header → host port fallback.

## Common pitfalls (read before debugging)

1. **Port mismatch** — compose must map to the same port the app binds (`PORT=8888`). Mismatch causes connection refused.
2. **containerMatch too broad** — `immich` matches `immich-public-proxy` (exited). Use `^Immich$|immich-server` or rely on running-container preference.
3. **Reachability 403** — still counts as OK (status &lt; 500). Use `probeUrl` for auth-gated UIs.
4. **Image name** — CI publishes `nasmono-home` (from GitHub repo `NasMono`), not `web-home` from the local folder name. Compose must match CI output.
5. **Don't use `env_file: .env` for nasmono-home** — injects dev vars; use explicit `environment` block.
6. **Typo folder** — components live in `packages/home/src/components/lauchpad/` (missing **n** in launchpad).

## Build & CI

Three commands — pick by how much signal you need:

| Command       | Speed | What it runs                                        |
| ------------- | ----- | --------------------------------------------------- |
| `pnpm check`  | Fast  | format + lint + build                               |
| `pnpm test`   | Fast  | vitest in all packages                              |
| `pnpm verify` | Full  | `check` + `test` + home smoke (API + Playwright UI) |

**Agents: run `pnpm verify` before finishing LaunchPad work.**  
Iterating on home only? `pnpm smoke` (build + API + UI smoke).

```bash
pnpm --filter home test:e2e   # UI smoke only (needs prior build)
```

- CI: `.github/workflows/ci.yml` — `verify` locally; CI runs build/test + **Playwright in official Docker image** (no browser download) + Docker smoke
- Release: `.github/workflows/release-on-merge.yml` → version bump, Docker push to GHCR on merge to `master`

## Verifying LaunchPad changes (agents)

Fixture-based tests — no Unraid or Docker socket required.

| Command                       | Use when                                        |
| ----------------------------- | ----------------------------------------------- |
| `pnpm verify`                 | Default — full monorepo gate                    |
| `pnpm smoke`                  | Home package only — build + API + Playwright UI |
| `pnpm --filter home test:e2e` | UI only, after `pnpm --filter home build`       |

**First-time locally:** `pnpm --filter home exec playwright install chromium`  
CI uses `mcr.microsoft.com/playwright:v1.57.0-noble` — browsers preinstalled, no `install-deps` apt step.

**Fixture env** (set automatically by vitest/playwright/smoke scripts):

- `DOCKER_FIXTURE_PATH=packages/home/test/fixtures/containers.json`
- Clears `UNRAID_API_KEY` / `UNRAID_GRAPHQL_URL` so tests never hit live NAS APIs

**What smoke tests assert (app correctness):**

- `GET /api/health` → `{ ok: true }`
- `GET /api/launchpad` → curated apps joined to fixture containers; Immich matches **running** `immich-server`; unmatched containers in `otherServices`
- Override merge via `test/fixtures/apps.override.json`
- `GET /api/reachability` input validation + mocked HTTP probe
- `config/launchpad.apps.json` strict validation
- Playwright UI: tiles, status badges, launch links, reachability text, System Services section

**Manual spot-check** (optional, after smoke passes):

```bash
DOCKER_FIXTURE_PATH=packages/home/test/fixtures/containers.json \
  UNRAID_API_KEY= UNRAID_GRAPHQL_URL= pnpm dev:home
# open http://localhost:8888 — tiles should reflect fixture container states
```

Unraid-specific checks (`*.tower` DNS, live GraphQL) stay **out of CI** — run on the NAS after deploy.

## Conventions

- Minimize scope; match existing patterns in `packages/home`
- Server code: ESM, `.js` extensions in imports, compiled to `dist-server/`
- Config JSON validated with Zod in `launchpadSchema.ts`
- Do not commit `.env` or secrets
- Only commit when explicitly asked
- **Before changing LaunchPad, deploy, reachability, or compose:** read relevant ADRs in `docs/decisions/`

## Docs map

- `README.md` — monorepo overview + Unraid deploy summary
- `docs/decisions/` — **ADRs** (why we chose X); index in `docs/decisions/README.md`
- `packages/home/README.md` — LaunchPad dev, config schema, troubleshooting
- `ARCHITECTURE.md` — Game Hub Socket.IO only
- `PLANNING.md` — Game Hub roadmap (future work, not decided)

## Cursor Cloud specific instructions

Standard commands live in `README.md` / root `package.json` / `packages/home/README.md`; only the non-obvious caveats are below. `pnpm install` is the only startup dependency step (run automatically).

**Services** (run each from repo root; all use `rolldown-vite`):

| Service     | Command                | Port | Notes                                               |
| ----------- | ---------------------- | ---- | --------------------------------------------------- |
| home        | `pnpm dev:home`        | 8888 | LaunchPad dashboard + Express API at `/api`         |
| game-hub    | `pnpm dev:game`        | 3000 | Vite proxies `/api` + `/socket.io` to game-server   |
| game-server | `pnpm dev:game-server` | 3001 | Socket.IO + Express; needs Postgres for persistence |

**Node:** active runtime is Node 22; the project targets Node 24 (CI, `Dockerfile`, `.node-version`). Node 22 satisfies `rolldown-vite` and runs all dev/lint/build/test tasks fine. (`.nvmrc` says 20 and is stale.)

**`.env`:** gitignored; copy from `.env.example` for local dev (`cp -n .env.example .env`). `home` runs fine without it (no Unraid creds → tiles show "NO CONTAINER"; reachability still probes external URLs server-side).

**Game stack needs a local Postgres** (system dependency, not installed by `pnpm install`):

- Start the cluster: `sudo pg_ctlcluster 16 main start` (it is NOT auto-started on VM boot).
- DB `game_hub` and role `postgres`/`postgres` already exist in the snapshot.
- `.env.example` defaults `DATABASE_URL` to `localhost:5432` for local dev; compose overrides this with `@db:5432` inside the Docker network.
- The schema is created **on demand**, not at startup: after game-server is up, run `curl -X POST http://localhost:3001/api/admin/actions/sync-db` once to create tables. Without this, login/lobby calls fail.

**Game Hub login** (`PlayerSetup`) calls `VITE_BACKEND_URL` (default `http://localhost:3001`) directly, while Socket.IO connects via the Vite proxy — both must be reachable for the lobby flow to work.
