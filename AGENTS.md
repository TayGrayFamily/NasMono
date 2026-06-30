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

```bash
pnpm --filter home build   # tsc + vite + tsc server
pnpm check                 # format + lint + build all
```

- CI: `.github/workflows/ci.yml` (lint, format, build, test)
- Release: `.github/workflows/release-on-merge.yml` → version bump, Docker push to GHCR on merge to `master`

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
