# Home — NAS LaunchPad

Vite + React dashboard for homelab services. Shows curated app tiles with Docker container status (via Unraid GraphQL) and server-side HTTP reachability checks.

## Quick start

From repo root:

```bash
cp .env.example .env
# Set UNRAID_GRAPHQL_URL and UNRAID_API_KEY in .env
pnpm install
pnpm dev:home
```

Open **http://localhost:8888**

## How it works

**Dev:** Vite serves the React app on port 8888 and mounts the Express API at `/api` (see `vite.config.ts`).

**Prod:** `node dist-server/prod.js` serves static `dist/` + `/api` (see `Dockerfile`).

### API endpoints

| Route                                          | Description                                                     |
| ---------------------------------------------- | --------------------------------------------------------------- |
| `GET /api/health`                              | Liveness                                                        |
| `GET /api/launchpad`                           | Merged app list + Docker status + unmatched containers          |
| `GET /api/containers`                          | Raw container list (debug)                                      |
| `GET /api/reachability?target=…&hostPort=…`    | Server-side HTTP probe                                          |
| `GET /api/admin/overview`                      | Unraid system + Docker overview                                 |
| `POST /api/admin/docker/refresh-digests`       | Refresh Unraid image digest cache (requires env gate)           |
| `POST /api/admin/docker/containers/:id/update` | Pull + recreate one container                                   |
| `POST /api/admin/docker/update-outdated`       | Update all containers with pending updates                      |
| `POST /api/admin/docker/update-stack`          | Batch update containers matching `STACK_UPDATE_CONTAINER_MATCH` |

### Docker updates (System view)

When `ADMIN_ACTIONS_ENABLED=true`, **System → Docker** shows image version, update badges, and per-container actions (Update image, Check for updates). Requires an Unraid API key with **Docker write** permissions—not read-only.

Compose-managed containers (e.g. `web_app`) can be updated via the same GraphQL mutations. This is not identical to Compose Manager's `compose pull + up -d`; use the **Compose Manager** link for full stack semantics. Updating `web_app` restarts the dashboard briefly.

**Unraid compose env** (see `docker-compose.unraid.yml`):

| Variable                       | Purpose                                         |
| ------------------------------ | ----------------------------------------------- |
| `ADMIN_ACTIONS_ENABLED`        | Enable POST mutation routes                     |
| `STACK_UPDATE_CONTAINER_MATCH` | Regex on container names for batch stack update |
| `COMPOSE_MANAGER_STACK_URL`    | Optional link to Compose Manager UI             |

## LaunchPad app config

**Defaults:** `config/launchpad.apps.json` (bundled in Docker image)

**Optional override on Unraid:** `/mnt/user/appdata/nasmono-home/apps.json`  
Set via `LAUNCHPAD_CONFIG_PATH=/config/apps.json` in compose.

Overrides merge **by `id`** — partial entries patch defaults; new ids are appended.

### Schema

```json
{
  "id": "jellyfin",
  "displayName": "Jellyfin",
  "url": "http://jellyfin.tower",
  "probeUrl": "http://jellyfin.tower/health",
  "iconUrl": "/static/jellyfin_logo.svg",
  "containerMatch": "jellyfin",
  "enabled": true
}
```

| Field            | Required | Notes                                                      |
| ---------------- | -------- | ---------------------------------------------------------- |
| `id`             | yes      | Stable key for merge                                       |
| `displayName`    | yes      | Tile title                                                 |
| `url`            | yes      | Full URL opened when tile is clicked                       |
| `iconUrl`        | yes      | Path under `/static/` or absolute URL                      |
| `containerMatch` | yes      | Regex (case-insensitive) on container name **or** image    |
| `probeUrl`       | no       | Health-check URL when `url` needs auth (see Pi-hole below) |
| `enabled`        | no       | Set `false` to hide without deleting                       |

Icons live in `public/static/`.

### Adding an app

1. Add icon to `public/static/` if needed
2. Add entry to `config/launchpad.apps.json`
3. Set `containerMatch` to the Unraid container name or a unique substring of the image
4. Use reverse-proxy URLs in `url` (e.g. `http://radarr.tower`)

**Compose stacks:** many containers share a prefix. Use exact patterns:

```json
"containerMatch": "^Immich$|immich-server"
```

**Auth-gated UIs:** set `probeUrl` to a public endpoint:

```json
"url": "http://pihole.tower/admin",
"probeUrl": "http://pihole.tower/api/docs/"
```

See `config/launchpad.apps.example.json` for override examples.

## Testing & smoke checks

Predictable integration tests use fixture containers — no Unraid or Docker socket required.

```bash
# From repo root
pnpm verify                            # full gate (what agents should run)
pnpm smoke                             # home only: build + API + Playwright UI
pnpm --filter home test:e2e            # UI only (needs prior build)

# API-only slice of smoke (after build)
node scripts/smoke-home.mjs --skip-build --api-only
```

**First-time setup:** `pnpm --filter home exec playwright install chromium`

Playwright drives a real browser against the **prod server** (`dist-server/prod.js`) with fixture containers. `/api/reachability` is mocked in tests so probes succeed without homelab network access.

```bash
DOCKER_FIXTURE_PATH=packages/home/test/fixtures/containers.json \
  UNRAID_API_KEY= UNRAID_GRAPHQL_URL= pnpm dev:home
```

CI runs the same Playwright tests in the official Playwright Docker image (no browser install step).

## Reachability

Probes run **from the server**, not the browser (avoids CORS).

1. Direct fetch to `probeUrl` or `url`
2. If that fails and `REACHABILITY_GATEWAY` is set → fetch gateway with `Host:` header (reverse proxy on Unraid host)
3. If that fails → try container's published host port via gateway

HTTP status **&lt; 500** counts as responding (401/403/404 still green — service is up).

Failed probes show error detail (`dns`, `connection_refused`, etc.).

## Deploy on Unraid

Use `docker-compose.unraid.yml` in Compose Manager.

**NAS `.env` (minimal):**

```env
UNRAID_API_KEY=your-key
```

**Optional:** `HOME_BACKEND_PORT=8888` to change host port.

After image updates:

```bash
docker compose -f docker-compose.unraid.yml up -d --force-recreate nasmono-home
```

Image: `ghcr.io/taygrayfamily/nasmono-home:latest` (published by GitHub Actions on merge to `master`).

## Troubleshooting

| Symptom                          | Likely cause                                                                                                   |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Connection refused on `:8888`    | Port mapping ≠ `PORT` env inside container — see [ADR-0004](../../docs/decisions/0004-port-8888-home-app.md)   |
| Docker status wrong / exited     | `containerMatch` hits wrong container; tighten regex                                                           |
| Responding locally, not deployed | Container can't resolve `*.tower` — see [ADR-0003](../../docs/decisions/0003-reachability-via-host-gateway.md) |
| Admin URL shows HTTP 403 green   | Expected; add `probeUrl` to a public path                                                                      |
| Empty LaunchPad                  | Missing/invalid `launchpad.apps.json` or Unraid GraphQL error — check logs                                     |

Related decisions: [`docs/decisions/`](../../docs/decisions/README.md)

## Project layout

```
packages/home/
  config/launchpad.apps.json   # default tiles
  public/static/               # icons
  server/                      # Express API (compiled to dist-server/)
  src/components/lauchpad/     # LaunchPad UI (note: lauchpad typo in path)
  src/routes/                  # TanStack Router pages
  Dockerfile                   # build from monorepo root
```
