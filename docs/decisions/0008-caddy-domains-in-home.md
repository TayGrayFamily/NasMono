# ADR-0008: Caddy Domains editor in packages/home

- **Status:** Accepted
- **Date:** 2026-07-01
- **Scope:** packages/home, docker

## Context

Homelab services are reachable at friendly `*.tower` hostnames via **Caddy** on Unraid. Nginx/NPM is being retired. The Caddyfile lives in Unraid **appdata**; operators today edit it through the container console or a host editor. LaunchPad tiles (`launchpad.apps.json`) use the same hostnames for launch URLs but remain **curated** (ADR-0002) — we want drift visibility, not auto-provisioning.

We need a **Domains** page under System (`/system/domains`) with a **structured editor** — not raw Caddyfile editing. Each row maps a hostname (`home.tower`) to a host port (`8888`). A single **upstream IP** field (NAS LAN address) applies to all routes; the app generates the Caddyfile and DNS entries internally on save.

## Decision

| Topic           | Choice                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Reverse proxy   | **Caddy only** — Nginx/NPM removed                                                                                           |
| Editor model    | **Hostname + port rows** + **one shared upstream IP** — Caddyfile generated internally                                       |
| DNS             | **Pi-hole custom entries** generated on save, same upstream IP pattern — format confirmed from owner DNS file in P1          |
| Config location | **Appdata** on Unraid: generated Caddyfile + DNS file + canonical `domains.json`                                             |
| Read/write      | App reads/writes generated files; **restarts Caddy** (and reloads Pi-hole DNS if needed) on save                             |
| Placement       | **`packages/home`** — `/system/domains` alongside Control panel, Docker, Storage                                             |
| LaunchPad       | Cross-reference / drift only; tiles stay curated (ADR-0002)                                                                  |
| Admin API       | **Not used in v1** — file + restart                                                                                          |
| Security        | LAN-only for v1; no auth gate yet                                                                                            |
| Env vars        | `CADDYFILE_PATH`, `CADDY_CONTAINER_NAME`, `DOMAINS_CONFIG_PATH`, `PIHOLE_DNS_PATH` (paths hardcoded in compose per ADR-0006) |

### P1 editor UX (owner requirements)

```
┌─────────────────────────────────────────────────────────┐
│ Upstream IP (LAN)   [ 192.168.1.50          ]           │
├──────────────────────┬──────────┬───────────────────────┤
│ Hostname             │ Port     │                       │
│ home.tower           │ 8888     │  [Edit] [Remove]      │
│ jellyfin.tower       │ 8096     │  [Edit] [Remove]      │
│ …                    │          │                       │
├──────────────────────┴──────────┴───────────────────────┤
│ [+ Add route]                        [Save]             │
└─────────────────────────────────────────────────────────┘
```

**Save flow (internal — not exposed in UI):**

1. Validate rows (`domains.json` / Zod schema)
2. `generateCaddyfile()` → write `CADDYFILE_PATH`
3. `generateDnsEntries()` → write `PIHOLE_DNS_PATH` (format TBD from owner file)
4. Restart Caddy container; reload Pi-hole DNS if required

**Generated Caddy block (example):**

```caddyfile
http://home.tower {
	reverse_proxy 192.168.1.50:8888
}
```

**Generated DNS line (proposed — confirm against owner file):**

```
192.168.1.50 home.tower
```

Canonical model: `packages/home/server/domainRoutesSchema.ts` + `domainRoutes.ts`. Fixture: `test/fixtures/domains.routes.json`.

### P0 spike — NAS paths and compose (proposed; verify on tower)

| Item                  | Proposed value                                          | Verify on NAS                                                                           |
| --------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Host Caddyfile        | `/mnt/user/appdata/caddy/Caddyfile`                     | **Confirmed** by owner                                                                    |
| Domains config        | `/mnt/user/appdata/nasmono-home/domains.json`           | Canonical editor state (hostname + port + upstream IP)                                  |
| Pi-hole DNS file      | `/mnt/user/appdata/binhex-official-pihole/etc-pihole/custom.list` | **Default for binhex template** — owner to confirm on tower (see below)              |
| `nasmono-home` mount  | `/mnt/user/appdata/caddy/Caddyfile:/caddy/Caddyfile:rw` | Match actual Caddy container host path                                                  |
| `CADDYFILE_PATH`      | `/caddy/Caddyfile`                                      | Generated output inside `nasmono-home` container                                        |
| `DOMAINS_CONFIG_PATH` | `/config/domains.json`                                  | RW via existing `/config` volume                                                        |
| `PIHOLE_DNS_PATH`     | TBD after owner shares file                             | Generated DNS output                                                                    |
| Caddy container name  | `caddy`                                                 | Docker tab → exact **Container name** (Unraid templates vary: `Caddy`, `caddyv2`, etc.) |
| Caddy internal path   | `/etc/caddy/Caddyfile`                                  | Caddy container template mapping                                                        |

Proposed `docker-compose.unraid.yml` additions for `nasmono-home` (P1 — not applied in P0):

```yaml
environment:
  CADDYFILE_PATH: /caddy/Caddyfile
  CADDY_CONTAINER_NAME: caddy
  DOMAINS_CONFIG_PATH: /config/domains.json
  PIHOLE_DNS_PATH: /pihole-dns/custom.list
  DOCKER_SOCKET_PATH: /var/run/docker.sock
volumes:
  - /mnt/user/appdata/caddy/Caddyfile:/caddy/Caddyfile
  - /mnt/user/appdata/binhex-official-pihole/etc-pihole/custom.list:/pihole-dns/custom.list
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

- P1: `/system/domains` structured editor + save + Caddy/DNS generation + restart
- P2: backup-before-write, `caddy validate` gate, drift column vs LaunchPad, optional raw Caddyfile mode
- Owner: share existing **Caddyfile** and **Pi-hole DNS file** so we match exact format; confirm `CADDY_CONTAINER_NAME` and paths on tower

## Links

- Roadmap: [`docs/roadmap/caddy-domains.md`](../roadmap/caddy-domains.md)
- Fixture: `packages/home/test/fixtures/domains.routes.json`, `domains.dns`, `Caddyfile`
- Drift snapshot: `packages/home/test/fixtures/caddy.launchpad-drift.json`
- ADR-0002 (curated tiles), ADR-0006 (compose env)
