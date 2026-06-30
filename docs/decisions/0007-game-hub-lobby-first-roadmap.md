# ADR-0007: Game Hub lobby-first roadmap and product direction

- **Status:** Accepted
- **Date:** 2026-06-30
- **Scope:** game-hub, game-server, monorepo

## Product decisions

| #   | Question           | Decision                                                                                                               |
| --- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| 1   | Audience           | Friends and family; **LAN-only for now**. May open publicly later.                                                     |
| 2   | Public tunnel      | **Remove** `public-tunnel` from compose (was exploratory).                                                             |
| 3   | First game         | **Just One** (cooperative word game).                                                                                  |
| 4   | Mobile             | **Desktop and mobile** from v1 (`useScreenMode` + responsive layouts).                                                 |
| 5   | Max lobby size     | Default cap **20 players**; admin setting may raise later.                                                             |
| 6   | Lobby card join    | **Auto-join** on card click (one step to enter lobby).                                                                 |
| 7   | Presence UI        | **Per-lobby only** — who is in _my_ lobby with connection status. No global sidebar.                                   |
| 8   | Lobby chat         | **Defer** — not in v1.                                                                                                 |
| 9   | Remove players     | **Host and admin** can kick/remove players from a lobby.                                                               |
| 10  | Session on refresh | **Persist session** (`localStorage`); restore user and rejoin last lobby when possible.                                |
| 11  | Postgres host port | **Keep `5432` exposed** for now (external tools). See [Postgres exposure](#postgres-host-port-5432) for when to close. |
| 12  | Auth               | **Display name only** for now — no passwords, JWT, or OAuth.                                                           |
| 13  | Game state         | **Persist to Postgres** so games can resume after server crash.                                                        |
| 14  | LaunchPad tile     | **Yes** — URL `http://games.tower` (DNS on homelab reverse proxy).                                                     |

## Context

The Game Hub stack (`packages/game-hub`, `packages/game-server`, `packages/just-one`) is deployed on Unraid alongside LaunchPad (`nasmono-home`). Today it is a **lobby MVP**: name-based identity, REST lobby CRUD, Socket.IO room updates (`player_joined`, `player_left`, `host_transferred`), and a dark-themed React UI. **No playable game exists** — the host "Start Game" button is a stub.

Access is **LAN-only** via `http://games.tower` (and port 8000 on the NAS). The Cloudflare `public-tunnel` service has been removed from compose. Unauthenticated `/debug` and `/api/admin/*` are acceptable on LAN for now but must be locked down before any public deploy.

`cursor/integration-smoke-tests-ba73` (in flight) adds Playwright smoke tests for **LaunchPad/home only**. Game Hub smoke tests follow once lobby UX stabilizes.

### Current capability inventory

| Area      | Works today                                   | Gaps                                                             |
| --------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Identity  | Find-or-create by unique display name         | No session persistence; refresh loses user                       |
| Lobbies   | Create, list, join, leave, host transfer      | Card click does not auto-join; no kick                           |
| Realtime  | Socket room per lobby; disconnect cleanup     | No per-player connection indicator                               |
| Games     | —                                             | `just-one` stub not integrated; no Postgres game state           |
| Ops       | Docker images, compose stack, admin GUI (dev) | Schema not auto-applied on boot; admin missing from Docker image |
| Discovery | `games.tower` planned                         | No LaunchPad tile yet                                            |

### UX friction observed (code review)

1. **Session loss on refresh** — `currentUser` is React state only.
2. **Split API base URLs** — login uses `VITE_BACKEND_URL`; lobby screens use relative `/api`.
3. **Lobby card "Join"** — navigates without joining.
4. **"N Online" badge** — counts members, not socket-connected players.
5. **Sign out** — does not disconnect socket or leave lobby.
6. **Version display** — `__APP_VERSION__` vs `VITE_APP_VERSION` mismatch.

## Decision

Adopt a **lobby-first, phased product roadmap**. Ship a trustworthy lobby experience before gameplay or horizontal scaling. Defer Redis until multi-instance game-server is needed.

### Phase 0 — Trustworthy lobby (ship-safe)

**Goal:** A friend on the home network opens `http://games.tower`, picks a name, joins a lobby in one click, and stays in the lobby across refresh.

| Work item                                                        | Rationale                                       |
| ---------------------------------------------------------------- | ----------------------------------------------- |
| Client session persistence (`localStorage` + re-emit `set_user`) | Refresh/reopen restores user (#10)              |
| Restore last lobby on load when user was a member                | Rejoin without re-clicking join                 |
| Unify API calls on relative `/api`                               | One dev/prod story                              |
| Auto-apply DB schema on game-server startup                      | First deploy must not require manual admin sync |
| `/api/health` on game-server                                     | Compose healthcheck parity with `nasmono-home`  |
| Protect `/debug` and `/api/admin/*` (env flag)                   | Lock down before public deploy                  |
| Fix admin static files in game-server Docker image               | Ops tooling works in prod                       |
| **Auto-join on lobby card click**                                | Product decision #6                             |
| Disconnect socket + leave lobby on sign out                      | Clean presence                                  |
| Enforce max lobby size (default 20)                              | Product decision #5                             |
| Host + admin **kick/remove player** API + UI                     | Product decision #9                             |

**Explicitly out of Phase 0:** JWT/password auth, Redis, first game, lobby chat, global online sidebar.

### Phase 1 — Lobby UX polish

**Goal:** Lobby feels alive; discoverable from LaunchPad.

| Work item                                     | Rationale                                |
| --------------------------------------------- | ---------------------------------------- |
| Realtime lobby list (notify-then-fetch)       | Matches `ARCHITECTURE.md`                |
| **Per-lobby** connection indicator per player | Product decision #7 — not a global panel |
| Ready-check before start                      | Host sees all ready before Just One      |
| LaunchPad tile → `http://games.tower`         | Product decision #14                     |

**Deferred:** Lobby chat (#8).

### Phase 2 — Platform contracts

**Goal:** Safe to add games without breaking clients.

| Work item                                            | Rationale                                |
| ---------------------------------------------------- | ---------------------------------------- |
| `packages/shared-types` for REST + Socket.IO events  | Single contract                          |
| Zod validation on all inbound REST and socket events | Prevent malformed payloads               |
| Drizzle migrations (replace raw SQL bootstrap)       | Schema evolution incl. game state tables |
| Game Hub Playwright smoke tests                      | After home smoke tests merge             |

**Defer Redis** until running >1 `game-server` instance.

### Phase 3 — First game (Just One)

**Goal:** Host starts Just One; state survives server crash.

| Work item                                                     | Rationale                          |
| ------------------------------------------------------------- | ---------------------------------- |
| Server-authoritative game state in `game-server`              | Cheat resistance                   |
| **Persist game state to Postgres**; resume on reconnect/crash | Product decision #13               |
| Game route `/lobbies/:id/game` (mobile + desktop)             | Lobby → game transition            |
| Socket namespace or `game:*` event prefix                     | Separate lobby vs gameplay traffic |
| Rewrite `packages/just-one` with shared contracts             | Current stub is broken             |

**Just One constraints:** Typical play 4–7 players; lobby holds up to 20. Validate count at game start (game-specific ADR TBD).

### Auth model

**v1:** Display-name find-or-create only (#12). Bind REST/socket actions to the identified socket user to reduce casual spoofing on LAN.

**Before public deploy:** Revisit passwords, invite links, or OAuth. No JWT work until then.

### Postgres host port 5432

**Decision:** Keep published on the NAS host for now (#11) — useful for `psql`, backups, and admin tools from your workstation.

**Why you might close it later:**

- **Attack surface** — anything on the LAN (or internet, if the NAS is reachable) can attempt connections if it discovers the port.
- **Unnecessary for the app** — `game-server` talks to `db` on the internal `game-network`; the host port mapping is only for _external_ access.
- **Mitigation without removing access** — bind to `127.0.0.1:5432:5432` and SSH tunnel, or restrict via Unraid firewall to admin IPs only.

## Alternatives considered

- **Games first, fix lobby later** — Rejected.
- **Redis + shared-types before UX** — Rejected for homelab single instance.
- **Merge game into LaunchPad** — Rejected; separate deployables.
- **Remove public tunnel; LAN-only** — Accepted; tunnel removed from compose.
- **Global connected-users sidebar** — Rejected for v1; per-lobby presence is enough (#7).
- **Lobby chat in v1** — Rejected (#8).

## Consequences

**Good:**

- All product questions resolved; implementation can proceed phase by phase
- Session + lobby rejoin matches friends-and-family casual use
- Postgres game state enables crash recovery for Just One

**Bad / tradeoffs:**

- Display-name auth is weak if LAN is compromised or service goes public
- Exposed Postgres port increases NAS risk slightly
- Kick/remove without full auth relies on socket identity binding

**Follow-ups:**

- Game-specific ADR for Just One rules and state machine
- LaunchPad tile in `launchpad.apps.json` (issue #28)
- P0 implementation (#25, #26)

## Links

- [`docs/roadmap/game-hub.md`](../roadmap/game-hub.md) — living roadmap (phases, issues, Project)
- `PLANNING.md`, `ARCHITECTURE.md`
- `packages/game-hub/`, `packages/game-server/`, `packages/just-one/`
- `docker-compose.unraid.yml`
- ADR [0005](./0005-ghcr-image-names-web-prefix.md), [0006](./0006-minimal-unraid-compose-env.md)
- GitHub issues: [#25](https://github.com/TayGrayFamily/NasMono/issues/25)–[#32](https://github.com/TayGrayFamily/NasMono/issues/32)
