# Caddy Domains (System)

**URL (prod):** `/system/domains` inside LaunchPad / System  
**Package:** `packages/home` only  
**ADR:** [ADR-0008](../decisions/0008-caddy-domains-in-home.md)

Homelab services use Caddy on Unraid for `*.tower` reverse-proxy routes. The Domains page lists every registered hostname, lets an admin edit upstream mappings, writes the Caddyfile back to appdata on save, and restarts the Caddy container.

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

**Owner action before P1:** SSH or Unraid terminal:

```bash
# Confirm Caddyfile host path
ls -la /mnt/user/appdata/caddy/Caddyfile

# Container name (exact string for CADDY_CONTAINER_NAME)
docker ps --format '{{.Names}}' | grep -i caddy
```

### P1 — Domains editor (v1)

**Done when:** `/system/domains` lists hostnames and upstreams; admin can add/edit/remove; Save writes appdata and restarts Caddy; errors if restart fails. Works on LAN.

_File separate GitHub issue when P0 merges._

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
| DNS (Pi-hole) record creation             | Separate concern                   |
| Auth gate on Domains page                 | LAN-only for now                   |
