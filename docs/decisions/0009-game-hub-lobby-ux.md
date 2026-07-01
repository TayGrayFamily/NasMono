# ADR-0009: Game Hub lobby UX and presence model

- **Status:** Accepted
- **Date:** 2026-07-01
- **Scope:** game-hub, game-server

## Context

The lobby MVP shipped create/join/leave and Socket.IO player list updates, but UX friction remained: two-step join from the list, misleading "Online" labels, session loss on refresh, and socket disconnect removing DB membership. [ADR-0007](./0007-game-hub-lobby-first-roadmap.md) defines phased delivery; this ADR records **owner-validated UX and presence decisions** for P0 implementation.

## Decision

### Join and lobby list

- **One-tap join:** Tapping a lobby card calls join API then navigates to the lobby — no preview/spectate room in v1.
- **Lobby cards** show: lobby name, **leader (host) display name**, and **player count**.
- **Preview room** deferred to a future feature.

### Presence and session

- **Soft disconnect:** Socket drop does **not** remove `lobby_players` rows. After Socket.IO heartbeat timeout, mark player **disconnected** in the lobby UI.
- **No auto-remove:** Disconnected players stay in the lobby until explicit leave.
- **Reconnect:** Refresh or device recovery re-enters the same lobby (DB membership persists); client restores route + `join_lobby_room`.
- **Explicit leave only:** `POST /leave`, Sign out, or joining a different lobby removes membership.
- **One session per user:** New tab replaces old socket (`set_user`); no duplicate sessions.
- **One lobby per user:** Joining a lobby auto-leaves any previous lobby.

### Host and start

- **No ready-check** before Start Game — host starts when they want.
- **Host transfer** via existing `transfer-host` API (UI: host ⋯ menu on player rows).
- **No kick/remove** in v1 — host cannot remove players yet.

### Mobile/web client pattern

- Single responsive web client (not native apps); **768px** breakpoint aligned across JS and CSS.
- Co-located component CSS; layout primitives: `Page`, `StickyActionBar`, `PlayerRow`, `LobbyCard`, `StatusStrip`, `ConfirmDialog`.
- CSS-first responsiveness; `useScreenMode` only for structural forks.

### Socket events (additions)

- `player_presence` `{ userId, connected: boolean }` — emitted on connect/disconnect to lobby room.

## Alternatives considered

- **Preview room before join** — rejected for v1; cards show leader + count instead.
- **Disconnect = leave lobby** (current code) — rejected; breaks reconnect story.
- **Ready-check toggles** — rejected; host-driven start only.
- **Kick disconnected players (v1)** — deferred; no auto-remove for now.

## Consequences

**Good:**

- Refresh and brief network blips do not eject players from lobbies
- Honest presence UI (connected / disconnected dots)
- One-click join matches friends-and-family casual use

**Bad / tradeoffs:**

- Lobbies can accumulate disconnected members until they explicitly leave
- Presence is in-memory on server (single instance); Redis deferred per ADR-0007
- Kick deferred — ADR-0007 P0 kick scope narrowed by owner decision

**Follow-ups:**

- Preview/spectate room before join
- Host remove disconnected player (when re-enabled)
- Realtime lobby list (notify-then-fetch) — P1 [#27](https://github.com/TayGrayFamily/NasMono/issues/27)
- Max lobby size 20 — P1
- Desktop master-detail layout — P1

## Links

- [ADR-0007](./0007-game-hub-lobby-first-roadmap.md)
- [`docs/roadmap/game-hub.md`](../roadmap/game-hub.md)
- `packages/game-hub/`, `packages/game-server/`
