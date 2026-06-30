# ADR-0007: Game Hub lobby-first roadmap and product direction

- **Status:** Accepted
- **Date:** 2026-06-30
- **Scope:** game-hub, game-server, monorepo

## Product decisions (2026-06-30)

| # | Question | Decision |
|---|----------|----------|
| 1 | Audience | Friends and family; **LAN-only for now**. May open publicly later. |
| 2 | Public tunnel | **Remove** `public-tunnel` from compose for now (was exploratory). |
| 3 | First game | **Just One** (cooperative word game). |
| 4 | Mobile | **Desktop and mobile** from v1 (`useScreenMode` + responsive layouts). |
| 5 | Max lobby size | Default cap **20 players**; admin setting may raise later. |

Remaining open questions: lobby join UX (#6), presence panel scope (#7), chat (#8), kick/private (#9), reconnect (#10), Postgres host bind (#11), auth model (#12), game persistence (#13), LaunchPad URL (#14). See [issue #32](https://github.com/TayGrayFamily/NasMono/issues/32).

## Context

The Game Hub stack (`packages/game-hub`, `packages/game-server`, `packages/just-one`) is deployed on Unraid alongside LaunchPad (`nasmono-home`). Today it is a **lobby MVP**: name-based identity, REST lobby CRUD, Socket.IO room updates (`player_joined`, `player_left`, `host_transferred`), and a dark-themed React UI. **No playable game exists** — the host "Start Game" button is a stub.

`PLANNING.md` and `ARCHITECTURE.md` describe future infrastructure (Redis, shared types, Zod, JWT) but lack product decisions: who is the audience, what games ship first, how auth should feel for a friends-and-family homelab, and what "done" looks like for v1.

The stack is deployed on Unraid alongside LaunchPad (`nasmono-home`). Access is **LAN-only** (port 8000); the Cloudflare `public-tunnel` service has been removed from compose. Unauthenticated `/debug` and `/api/admin/*` remain a concern on the local network.

`cursor/integration-smoke-tests-ba73` (in flight) adds Playwright smoke tests for **LaunchPad/home only**. Game Hub has no E2E coverage and should follow a similar pattern once lobby UX stabilizes — not before, to avoid churn.

### Current capability inventory

| Area | Works today | Gaps |
|------|-------------|------|
| Identity | Find-or-create by unique display name | No passwords, no session tokens, refresh loses user |
| Lobbies | Create, list, join, leave, host transfer | List not realtime; card "Join" only navigates |
| Realtime | Socket room per lobby; disconnect cleanup | No connected-users broadcast; no lobby-list events |
| Games | — | `just-one` stub uses wrong event (`join-lobby`); not routed in game-hub |
| Ops | Docker images, compose stack, admin GUI (dev) | Schema not auto-applied on boot; admin missing from Docker image; no `/api/health` |
| Discovery | LAN on port 8000 | No LaunchPad tile |

### UX friction observed (code review)

1. **Session loss on refresh** — `currentUser` is React state only; no `localStorage`/cookie.
2. **Split API base URLs** — login uses `VITE_BACKEND_URL`; lobby screens use relative `/api` (works via nginx proxy in prod, inconsistent in dev).
3. **Misleading "Join" on lobby cards** — navigates to detail; user must click "Join Lobby" again.
4. **"N Online" badge** — counts lobby members, not socket-connected players.
5. **Sign out** — clears state but does not disconnect socket or leave lobby.
6. **Version display** — `vite.config.ts` defines `__APP_VERSION__` but `App.tsx` reads `VITE_APP_VERSION` (always `0.0.0`).

## Decision

Adopt a **lobby-first, phased product roadmap**. Ship a trustworthy lobby experience before gameplay or horizontal scaling. Defer Redis and multi-instance Socket.IO until there is a second game-server replica or measurable need.

### Phase 0 — Trustworthy lobby (ship-safe)

**Goal:** A friend on the home network can open Game Hub, pick a name, create/join a lobby, and stay in sync.

| Work item | Rationale |
|-----------|-----------|
| Client session persistence (localStorage + re-emit `set_user`) | Refresh should not feel like logout |
| Unify API calls on relative `/api` (or env consistently) | One dev/prod story |
| Auto-apply DB schema on game-server startup | First deploy must not require manual admin sync |
| `/api/health` on game-server | Compose healthcheck parity with `nasmono-home` |
| Protect `/debug` and `/api/admin/*` (env flag or basic auth) | LAN exposure; lock down before any public deploy |
| Fix admin static files in game-server Docker image | Ops tooling works in prod |
| Fix lobby card join flow (join on card click or rename to "View") | Reduce confusion |
| Disconnect socket + leave lobby on sign out | Clean presence |
| Enforce max lobby size (default 20; admin override later) | Product cap; Just One typically 4–7 but lobby may hold more |

**Explicitly out of Phase 0:** JWT, Redis, first game, connected-users global panel.

**Goal:** Lobby feels alive and multiplayer-ready.

| Work item | Rationale |
|-----------|-----------|
| Realtime lobby list (`lobby_created` / `lobby_updated` / notify-then-fetch) | Matches ARCHITECTURE.md notify-then-fetch pattern |
| Per-player connection indicator (socket presence in lobby room) | Replace misleading "N Online" |
| Ready-check before start (host sees all ready) | Standard party-game pattern |
| Optional lobby chat (text only) | Social glue; validate namespace need |
| LaunchPad tile for Game Hub | Discoverability from home dashboard |

### Phase 2 — Platform contracts

**Goal:** Safe to add games without breaking clients.

| Work item | Rationale |
|-----------|-----------|
| `packages/shared-types` for REST + Socket.IO events | Single contract |
| Zod validation on all inbound REST and socket events | Prevent malformed payloads |
| Drizzle migrations (replace raw SQL + manual `setupDatabase`) | Schema evolution |
| Game Hub Playwright smoke tests (mirror home smoke-test pattern) | CI confidence; after `integration-smoke-tests` merges |

**Defer Redis** until running >1 `game-server` instance or cross-process presence is required.

### Phase 3 — First game (Just One)

**Goal:** Host clicks "Start Game" and all lobby players enter a synchronized Just One session.

| Work item | Rationale |
|-----------|-----------|
| Server-authoritative game state module in `game-server` | Cheat resistance; single source of truth |
| Game route in `game-hub` (e.g. `/lobbies/:id/game`) | Lobby → game transition; responsive on mobile + desktop |
| Socket namespace or event prefix for game traffic (`/game` or `game:*`) | Separate lobby signaling from tick updates |
| Rewrite `packages/just-one` to use shared contracts and game-hub routing | Current stub uses wrong socket event and is not integrated |

**Just One constraints:** Typical play is 4–7 players; lobby may hold up to 20. Game start should validate player count fits Just One rules (TBD in game ADR).

### Auth model (phased, not big-bang)

**Phase 0:** Keep display-name identity but bind actions to the socket-established user (reject `userId` in body if it does not match identified socket). Prevents casual impersonation without full login UX.

**Phase 1+:** Evaluate **invite-link tokens** (lobby URL with signed token) vs **password accounts** vs **OAuth (Discord/Google)** for friends-and-family use. Full JWT is planned in `PLANNING.md` but may be heavier than needed for a private homelab.

## Alternatives considered

- **Games first, fix lobby later** — Rejected. "Start Game" stub blocks any playtesting; security holes are worse once game state has value.
- **Redis + shared-types before UX** — Rejected. Infrastructure without users adds complexity; single-instance homelab does not need Redis yet.
- **Merge game into LaunchPad single app** — Rejected for now. Separate deployables allow independent release; Game Hub has different scaling and DB needs.
- **Remove public tunnel; LAN-only** — **Accepted.** `public-tunnel` removed from `docker-compose.unraid.yml`. Re-add with Cloudflare Access if opened to the internet later.

## Consequences

**Good:**

- Clear sequencing: trust → UX → contracts → gameplay
- Aligns with existing `ARCHITECTURE.md` patterns (notify-then-fetch, state snapshots for games)
- Does not conflict with in-flight home smoke tests
- Each phase is shippable independently

**Bad / tradeoffs:**

- Display-name auth remains weak until Phase 1+ auth decision
- Deferring Redis limits horizontal scale (acceptable for homelab)
- `just-one` package stays dead weight until Phase 3

**Follow-ups:**

- GitHub issues per phase (linked below)
- Revisit auth model before any public deploy
- Game-specific ADR for Just One rules and state machine
- Update `PLANNING.md` when phases complete

## Open questions (remaining)

### UX & features

6. **Lobby list join behavior:** One-click join from card, or view-then-confirm?
7. **Connected users panel:** Global "who's online" sidebar, or per-lobby presence only?
8. **Chat:** Required for v1, or defer?
9. **Kick player / private lobbies / passwords:** Any needed before first game?
10. **Rejoin after disconnect:** Auto-rejoin last lobby on reconnect, or return to lobby list?

### Technical & ops

11. **Postgres on host port 5432:** Intentional for external tools, or bind localhost only?
12. **Auth approach:** Invite links, shared household password, per-user accounts, or OAuth?
13. **Game state persistence:** Ephemeral (lobby lifetime) or save/resume games?
14. **LaunchPad integration:** Tile URL — `http://tower:8000` or reverse-proxy hostname?

## Links

- `PLANNING.md`, `ARCHITECTURE.md`
- `packages/game-hub/`, `packages/game-server/`, `packages/just-one/`
- `docker-compose.unraid.yml` (game stack; `public-tunnel` removed 2026-06-30)
- ADR [0005](./0005-ghcr-image-names-web-prefix.md), [0006](./0006-minimal-unraid-compose-env.md)
- In flight: `cursor/integration-smoke-tests-ba73` (home smoke tests — separate scope)
- GitHub issues:
  - [#25](https://github.com/TayGrayFamily/NasMono/issues/25) P0 UX quick wins
  - [#26](https://github.com/TayGrayFamily/NasMono/issues/26) P0 security, ops, session
  - [#27](https://github.com/TayGrayFamily/NasMono/issues/27) P1 realtime lobby + presence
  - [#28](https://github.com/TayGrayFamily/NasMono/issues/28) P1 LaunchPad tile
  - [#29](https://github.com/TayGrayFamily/NasMono/issues/29) P3 first game
  - [#30](https://github.com/TayGrayFamily/NasMono/issues/30) P2 Playwright smoke tests
  - [#31](https://github.com/TayGrayFamily/NasMono/issues/31) P2 shared types + Zod
  - [#32](https://github.com/TayGrayFamily/NasMono/issues/32) Product decisions (open questions)
