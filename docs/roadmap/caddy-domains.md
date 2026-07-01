# Caddy Domains (System)

**URL (prod):** `/system/domains` inside LaunchPad / System  
**Package:** `packages/home` only  
**ADR:** [ADR-0008](../decisions/0008-caddy-domains-in-home.md)

Homelab services use Caddy on Unraid for `*.tower` reverse-proxy routes. The Domains page is a **structured editor**: each row is a hostname (`home.tower`) and port (`8888`), plus one **upstream IP** field shared by all routes. On save, the app generates the Caddyfile and Pi-hole DNS entries internally — operators never edit raw Caddy syntax in v1.

## Phases

### P0 — Spike ✅ (this doc)

**Done when:** Appdata path, Caddy container name, sample Caddyfile, drift vs LaunchPad, validation strategy, and CI approach documented.

| Task                                | Status                 | Notes                                                                |
| ----------------------------------- | ---------------------- | -------------------------------------------------------------------- |
| Appdata path + compose volume + env | ✅ Proposed            | See ADR-0008; **verify on NAS** before P1 merge                      |
| Caddy container name                | ⚠️ Placeholder `caddy` | Check Docker tab on tower                                            |
| Sample Caddyfile                    | ✅                     | `packages/home/test/fixtures/Caddyfile`                              |
| Drift vs LaunchPad                  | ✅                     | `packages/home/test/fixtures/caddy.launchpad-drift.json` + unit test |
| Validation strategy                 | ✅                     | `caddy validate` via `caddy:2-alpine` (P1/P2)                        |
| CI approach                         | ✅                     | Fixture path + mock restart env; `caddyfileHosts.test.ts`            |

**Owner action before P1:** Share your existing files so we match your patterns exactly:

1. **Caddyfile** — confirms upstream IP:port style
2. **Pi-hole DNS custom entries** — confirms line format (`IP hostname` vs `address=/host/IP`, etc.)

Then verify on tower:

```bash
# Confirm Caddyfile host path
ls -la /mnt/user/appdata/caddy/Caddyfile

# Pi-hole DNS file (path varies by template — share yours)
# e.g. ls -la /mnt/user/appdata/binhex-official-pihole/etc-pihole/custom.list

# Container name (exact string for CADDY_CONTAINER_NAME)
docker ps --format '{{.Names}}' | grep -i caddy
```

### P1 — Domains editor (v1)

**Done when:** `/system/domains` shows upstream IP + route table; admin can add/edit/remove rows; Save writes `domains.json`, regenerates Caddyfile + DNS, restarts Caddy; errors if restart fails. Works on LAN.

**UI fields (only these are user-facing):**

| Field       | Example        | Notes                                                    |
| ----------- | -------------- | -------------------------------------------------------- |
| Upstream IP | `192.168.1.50` | NAS LAN IP — used for every `reverse_proxy` and DNS line |
| Hostname    | `home.tower`   | Must end in `.tower` (or match existing pattern)         |
| Port        | `8888`         | Published host port for the service                      |

**Internal on save** (not shown in UI):

- `domains.json` ← canonical state (`domainRoutesSchema.ts`)
- `Caddyfile` ← `generateCaddyfile()`
- Pi-hole DNS file ← `generateDnsEntries()` (format from owner file)
- Caddy container restart via dockerode

Implementation modules (spike landed in P0 PR):

- `packages/home/server/domainRoutesSchema.ts`
- `packages/home/server/domainRoutes.ts`
- Fixtures: `test/fixtures/domains.routes.json`, `domains.dns`, `Caddyfile`

### P2 — Safety and polish

Backup-before-write; `caddy validate` before save; drift column vs LaunchPad; optional raw Caddyfile mode.

## Drift snapshot (fixture vs LaunchPad defaults)

Based on `packages/home/test/fixtures/Caddyfile` and `config/launchpad.apps.json`:

| Hostname         | In fixture Caddy | In LaunchPad | Notes                                                                            |
| ---------------- | ---------------- | ------------ | -------------------------------------------------------------------------------- |
| `immich.tower`   | ✅               | ✅           |                                                                                  |
| `jellyfin.tower` | ✅               | ✅           |                                                                                  |
| `frame.tower`    | ✅               | ✅           | LaunchPad URL has query params                                                   |
| `radarr.tower`   | ✅               | ✅           |                                                                                  |
| `sonarr.tower`   | ✅               | ✅           |                                                                                  |
| `torrent.tower`  | ✅               | ✅           | qBittorrent tile                                                                 |
| `pihole.tower`   | ✅               | ✅           | LaunchPad uses `/admin` path                                                     |
| `games.tower`    | ✅               | —            | Game Hub planned ([ADR-0007](../decisions/0007-game-hub-lobby-first-roadmap.md)) |
| `home.tower`     | ✅               | —            | Optional alias for LaunchPad itself                                              |
| `unraid.tower`   | ✅               | —            | System link (`unraidLinks.ts`), not a tile                                       |

**Live NAS drift** may differ — re-run comparison after deploy using the Domains API or `caddyfileHosts` helpers.

## Deferred (not v1)

| Item                                      | Notes                              |
| ----------------------------------------- | ---------------------------------- |
| Auto-provision LaunchPad tiles from Caddy | ADR-0002 — opt-in only if ever     |
| Caddy Admin API / reload without restart  | File + restart is v1               |
| TLS / ACME management                     | Homelab may use HTTP-only `.tower` |
| Raw Caddyfile editor                      | P2 optional escape hatch           |
| Auth gate on Domains page                 | LAN-only for now                   |
