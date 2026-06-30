# Project Planning - Game Hub

## Purpose

Track progress and planned features for the Game Hub (`packages/game-hub`, `packages/game-server`).

**Product direction:** [ADR-0007](docs/decisions/0007-game-hub-lobby-first-roadmap.md) (**Accepted** — all product questions resolved 2026-06-30).

## Product decisions (summary)

| Topic | Decision |
|-------|----------|
| Audience | Friends/family on LAN (`games.tower`); may go public later |
| First game | Just One |
| Platforms | Desktop + mobile |
| Lobby size | Max 20 (admin may raise later) |
| Join flow | Auto-join from lobby list card |
| Presence | Per-lobby connection status only |
| Chat | Deferred |
| Kick players | Host + admin |
| Session | Persist user + rejoin lobby on refresh |
| Auth | Display name only |
| Game state | Postgres persistence for crash resume |
| LaunchPad | Tile → `http://games.tower` |

## Current state (2026-06-30)

Lobby MVP works in dev: login, lobby CRUD, Socket.IO updates, host transfer. No playable game yet.

## Phased roadmap

### Phase 0 — Trustworthy lobby (next)

- [ ] Session persistence + restore last lobby on refresh
- [ ] Unify API URL strategy (`/api` everywhere)
- [ ] Auto-apply DB schema on game-server startup
- [ ] `/api/health` + compose healthcheck
- [ ] Protect `/debug` and `/api/admin/*` (env-gated)
- [ ] Fix admin static files in Docker image
- [ ] Auto-join on lobby card click
- [ ] Sign-out: disconnect socket + leave lobby
- [ ] Bind socket actions to identified user
- [ ] Max lobby size (20)
- [ ] Kick/remove player (host + admin)

### Phase 1 — Lobby UX polish

- [ ] Realtime lobby list
- [ ] Per-lobby player connection indicators
- [ ] Ready-check before game start
- [ ] LaunchPad tile (`http://games.tower`)

### Phase 2 — Platform contracts

- [ ] `packages/shared-types`
- [ ] Zod validation
- [ ] Drizzle migrations
- [ ] Playwright smoke tests (after home smoke tests merge)

### Phase 3 — Just One

- [ ] Server-authoritative game state
- [ ] Postgres game state + crash resume
- [ ] Game route `/lobbies/:id/game`
- [ ] Rewrite `packages/just-one`

## Deferred

- Lobby chat
- Global "who's online" sidebar
- Redis / multi-instance Socket.IO
- JWT / password auth (revisit before public deploy)

## Completed

- [x] Drizzle ORM + lobby REST/Socket.IO MVP
- [x] React UI (login, lobbies, profile)
- [x] Docker + Unraid compose (LAN-only; tunnel removed)
- [x] Product roadmap ADR-0007

---

Update this file when issues close or phases ship.
