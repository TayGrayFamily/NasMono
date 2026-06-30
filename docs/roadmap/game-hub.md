# Game Hub roadmap

**URL (prod):** `http://games.tower`  
**Packages:** `packages/game-hub`, `packages/game-server`, `packages/just-one`  
**Decisions:** [ADR-0007](../decisions/0007-game-hub-lobby-first-roadmap.md) (Accepted)  
**Project board:** [Game Hub](https://github.com/orgs/TayGrayFamily/projects) (GitHub Project)  
**Dev:** `pnpm dev:game` — Postgres + server + hub (see [`AGENTS.md`](../../AGENTS.md))

## Vision

Friends and family on the home LAN open Game Hub from LaunchPad or `games.tower`, pick a display name, join a lobby in one click, and play **Just One** together. Desktop and mobile. Session survives refresh. Game state survives server crash.

## Current state (2026-06-30)

| Works | Does not work yet |
| ----- | ----------------- |
| Display-name login | Session persistence across refresh |
| Create / join / leave lobbies | Auto-join from lobby list card |
| Socket.IO lobby updates | Kick player |
| Host transfer | Realtime lobby list |
| Disconnect cleanup | Per-player connection indicator |
| | Just One gameplay |
| | LaunchPad tile |

## Phases

Tasks live in **GitHub issues** — the issue is the checklist. This section is the narrative and done-when criteria.

### P0 — Trustworthy lobby

**Done when:** A player on LAN can log in, auto-join a lobby from the list, refresh the page and land back in the same lobby, and sign out cleanly. Host or admin can remove a player. Fresh Docker deploy works without manual schema sync.

| Issue | Title |
| ----- | ----- |
| [#26](https://github.com/TayGrayFamily/NasMono/issues/26) | Security, ops, session persistence |
| [#25](https://github.com/TayGrayFamily/NasMono/issues/25) | UX quick wins (auto-join, sign out, labels) |

Also in scope (may land in above PRs): max lobby size 20, `/api/health`, env-gated admin/debug, Docker admin fix.

### P1 — Lobby UX polish

**Done when:** Lobby list updates without manual refresh; each player shows connected/disconnected in the lobby; host can ready-check before start; LaunchPad shows a tile to `http://games.tower`.

| Issue | Title |
| ----- | ----- |
| [#27](https://github.com/TayGrayFamily/NasMono/issues/27) | Realtime lobby list + per-player presence |
| [#28](https://github.com/TayGrayFamily/NasMono/issues/28) | LaunchPad tile |

### P2 — Platform contracts

**Done when:** Shared types package exists; server validates REST and socket payloads with Zod; schema changes use migrations; Playwright smoke tests cover core lobby flows in CI.

| Issue | Title |
| ----- | ----- |
| [#31](https://github.com/TayGrayFamily/NasMono/issues/31) | Shared types + Zod |
| [#30](https://github.com/TayGrayFamily/NasMono/issues/30) | Playwright smoke tests (after home smoke tests merge) |

### P3 — Just One

**Done when:** Host starts game from lobby; all players enter synchronized Just One UI; game state in Postgres; reconnect after crash resumes the round.

| Issue | Title |
| ----- | ----- |
| [#29](https://github.com/TayGrayFamily/NasMono/issues/29) | Server authority, routing, Just One integration |

Follow-up: game-specific ADR for Just One rules and state machine.

## Deferred (not v1)

| Item | Notes |
| ---- | ----- |
| Lobby chat | ADR-0007 #8 |
| Global “who’s online” sidebar | Per-lobby presence is enough |
| Redis / multi-instance Socket.IO | Single homelab instance |
| JWT / password auth | Display name on LAN; revisit before public deploy |
| Public Cloudflare tunnel | Removed from compose; re-add only with access control |
| Second game | After Just One ships |

## Someday / ideas backlog

_Not scheduled — capture ideas here before they become issues._

- Spectator mode for large lobbies
- Private lobbies with invite link (when auth exists)
- Game history / stats
- TV-optimized layout (10-foot UI)
- OAuth (Discord) for friends outside LAN

## Completed

- [x] Lobby REST + Socket.IO MVP
- [x] React UI (login, lobbies, profile)
- [x] Docker + Unraid compose (LAN-only)
- [x] ADR-0007 product direction
- [x] Planning layers (roadmap + issues + Project)
