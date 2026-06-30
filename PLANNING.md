# Project Planning - Game Hub

## Purpose

Track progress and planned features for the Game Hub (`packages/game-hub`, `packages/game-server`).

**Product direction:** See [ADR-0007: Game Hub lobby-first roadmap](docs/decisions/0007-game-hub-lobby-first-roadmap.md) for phased delivery, open questions, and GitHub issue breakdown.

## Current state (2026-06-30)

Lobby MVP is functional in development: name-based login, lobby CRUD, Socket.IO room updates, host transfer, disconnect cleanup. **No playable game** — "Start Game" is a stub. `packages/just-one` is not integrated.

## Phased roadmap (summary)

### Phase 0 — Trustworthy lobby (in progress)

- [ ] Client session persistence (`localStorage`)
- [ ] Unify API URL strategy (`/api` proxy everywhere)
- [ ] Auto-apply DB schema on game-server startup
- [ ] `/api/health` + compose healthcheck for game-server
- [ ] Protect `/debug` and `/api/admin/*`
- [ ] Fix admin static files in game-server Docker image
- [ ] Fix lobby card join UX
- [ ] Sign-out: disconnect socket + leave lobby
- [ ] Bind socket actions to identified user (anti-spoof)

### Phase 1 — Lobby UX polish

- [ ] Realtime lobby list (socket notify-then-fetch)
- [ ] Per-player connection indicators in lobby
- [ ] Ready-check before game start
- [ ] Optional lobby chat
- [ ] LaunchPad tile for Game Hub

### Phase 2 — Platform contracts

- [ ] `packages/shared-types` for REST + Socket.IO events
- [ ] Zod validation on all inbound requests/events
- [ ] Drizzle migrations (replace raw SQL bootstrap)
- [ ] Game Hub Playwright smoke tests (after home smoke tests merge)

### Phase 3 — First game

- [ ] Server-authoritative game state in game-server
- [ ] Game route in game-hub (`/lobbies/:id/game`)
- [ ] Game socket namespace or event prefix
- [ ] Integrate or replace `packages/just-one`

## Deferred (not blocking v1)

- **Redis / Socket.IO adapter** — defer until multi-instance game-server is needed
- **Full JWT/password auth** — evaluate after Phase 0 socket binding; see ADR-0007 auth section

## Architecture reference

Socket.IO design principles: [`ARCHITECTURE.md`](./ARCHITECTURE.md)

## Completed

- [x] Database: Drizzle ORM initialized; raw SQL for lobby operations
- [x] Tooling: tsconfig build support
- [x] Lobby REST + Socket.IO MVP (create, join, leave, host transfer)
- [x] React UI: login, lobby list, lobby detail, profile rename
- [x] Docker images + Unraid compose stack

---

**Note:** Update this file when GitHub issues close or ADR-0007 phases ship.
