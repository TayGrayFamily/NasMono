# ADR-0008: Caddy Domains editor in packages/home

- **Status:** Accepted
- **Date:** 2026-07-01
- **Scope:** packages/home, docker

## Context

Homelab services are reachable at friendly `*.tower` hostnames via **Caddy** on Unraid. Nginx/NPM is being retired. The Caddyfile lives in Unraid **appdata**; operators today edit it through the container console or a host editor. LaunchPad tiles (`launchpad.apps.json`) use the same hostnames for launch URLs but remain **curated** (ADR-0002) — we want drift visibility, not auto-provisioning.

We need a **Domains** page under System (`/system/domains`) that lists hostnames, lets an admin edit mappings, writes the Caddyfile back to appdata on save, and reloads Caddy.

## Decision

| Topic           | Choice                                                                                                                        |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Reverse proxy   | **Caddy only** — Nginx/NPM removed                                                                                            |
| Config location | **Appdata** on Unraid, mounted read/write into `nasmono-home`                                                                 |
| Read/write      | App reads and writes the Caddyfile; **restarts Caddy container** on save (v1)                                                 |
| Placement       | **`packages/home`** — `/system/domains` alongside Control panel, Docker, Storage                                              |
| LaunchPad       | Cross-reference / drift only; tiles stay curated (ADR-0002)                                                                   |
| Admin API       | **Not used in v1** — file + restart                                                                                           |
| Security        | LAN-only for v1; no auth gate yet                                                                                             |
| Env vars        | `CADDYFILE_PATH`, `CADDY_CONTAINER_NAME` (hardcoded in compose per ADR-0006; secrets stay in NAS `.env` only if needed later) |

### P0 spike — NAS paths and compose (proposed; verify on tower)

| Item                 | Proposed value                                          | Verify on NAS                                                                           |
| -------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Host Caddyfile       | `/mnt/user/appdata/caddy/Caddyfile`                     | Confirm file exists (not a directory mount mistake)                                     |
| `nasmono-home` mount | `/mnt/user/appdata/caddy/Caddyfile:/caddy/Caddyfile:rw` | Match actual Caddy container host path                                                  |
| `CADDYFILE_PATH`     | `/caddy/Caddyfile`                                      | Inside `nasmono-home` container                                                         |
| Caddy container name | `caddy`                                                 | Docker tab → exact **Container name** (Unraid templates vary: `Caddy`, `caddyv2`, etc.) |
| Caddy internal path  | `/etc/caddy/Caddyfile`                                  | Caddy container template mapping                                                        |

Proposed `docker-compose.unraid.yml` additions for `nasmono-home` (P1 — not applied in P0):

```yaml
environment:
  CADDYFILE_PATH: /caddy/Caddyfile
  CADDY_CONTAINER_NAME: caddy
  DOCKER_SOCKET_PATH: /var/run/docker.sock
volumes:
  - /mnt/user/appdata/caddy/Caddyfile:/caddy/Caddyfile
  - /var/run/docker.sock:/var/run/docker.sock
```

`DOCKER_SOCKET_PATH` enables **dockerode** container restart (same library as `DockerodeSource`); no `docker` CLI shell-out.

### P0 spike — container restart

Unraid GraphQL exposes container **read** queries (`docker { containers { names state status } }`) but **no restart mutation** as of Unraid API 2026-01 ([unraid/api#1871](https://github.com/unraid/api/issues/1871)). **v1 restart path:** dockerode via mounted Docker socket, using `CADDY_CONTAINER_NAME`. Revisit GraphQL when a restart mutation ships.

### P0 spike — validation (pre-save)

| Option               | Verdict                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **`caddy validate`** | **Chosen for P1/P2** — full syntax + config check; run via `caddy:2-alpine` sidecar/`docker run` so `nasmono-home` image stays slim |
| JSON config adapter  | Rejected — homelab uses Caddyfile; editor is file-based                                                                             |
| Syntax-only (regex)  | Rejected for save gate — insufficient; OK for listing hostnames / drift in P1                                                       |

P2 adds backup-before-write; validation runs before write.

### P0 spike — CI

Mirror `DOCKER_FIXTURE_PATH` pattern:

- `packages/home/test/fixtures/Caddyfile` — representative homelab routes (redacted)
- `CADDYFILE_FIXTURE_PATH` — load fixture instead of `CADDYFILE_PATH` in tests
- `CADDY_RESTART_FIXTURE=ok|fail` — mock restart outcome (no socket in CI)
- Unit tests: hostname extraction + LaunchPad drift (`caddyfileHosts.test.ts`)

## Alternatives considered

- **Caddy Admin API** — simpler reload, but extra port/auth; deferred
- **Separate `packages/caddy-domains`** — rejected; belongs in System nav
- **Read-only registry first** — rejected; owner wants edit-on-save from v1
- **Auto-provision LaunchPad tiles from Caddy** — conflicts with ADR-0002

## Consequences

**Good:**

- Single UI for homelab reverse-proxy routes alongside Docker status
- File-based config matches how Caddy runs on Unraid today
- Fixture-based tests avoid NAS dependency in CI

**Bad / tradeoffs:**

- Restart on save causes brief proxy blip (Admin API reload deferred)
- `nasmono-home` needs RW Caddyfile mount + Docker socket for restart
- Bad Caddyfile on save can break all `*.tower` routes → validation + backup in P2
- Exact appdata path and container name require one-time NAS verification

**Follow-ups:**

- P1: `/system/domains` editor + save + restart
- P2: backup-before-write, `caddy validate` gate, drift column vs LaunchPad
- Owner: confirm `CADDY_CONTAINER_NAME` and host Caddyfile path on tower

## Links

- Roadmap: [`docs/roadmap/caddy-domains.md`](../roadmap/caddy-domains.md)
- Fixture: `packages/home/test/fixtures/Caddyfile`
- Drift snapshot: `packages/home/test/fixtures/caddy.launchpad-drift.json`
- ADR-0002 (curated tiles), ADR-0006 (compose env)
