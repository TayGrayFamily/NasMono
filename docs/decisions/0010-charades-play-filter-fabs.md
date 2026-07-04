# ADR-0010: Charades play-screen filter FABs

- **Status:** Accepted
- **Date:** 2026-07-04
- **Scope:** packages/charades, game-hub

## Context

Solo / pass-and-play Charades asks each actor to pick a difficulty before revealing their card. The previous **Pick card** bottom sheet hid filters behind an extra tap and menu affordance. Playtest feedback: players passing the phone found it frustrating to get a specific difficulty (especially on mobile).

Goals:

- Obvious, tappable controls for all ages — no tutorial
- Filters visible on every turn, including the **first card**
- Persist last choices between turns so the next player sees a hint
- Reveal disabled until a difficulty is chosen for the current turn

## Decision

### Play screen UX

- Replace the **Pick card** sheet with **always-visible filter floating action buttons (FABs)** above the primary dock on mobile (in-flow on desktop).
- **One difficulty per draw:** tapping Easy, Normal, or Hard immediately draws a matching card and highlights that FAB (green / yellow / red).
- **Reveal** stays disabled until a difficulty FAB is tapped for the current turn — even on the first card.
- **Card face** shows “Pick a difficulty first” until draw; prompt text mirrors the FAB labels.
- **Pack FABs** (multi-pack rounds only) toggle which packs the next draw can come from; changing packs resets the turn so difficulty must be tapped again.
- **Persist** `lastDifficulty` and `lastPackIds` in `sessionStorage` (`charades-play-pick`); dashed outline on the last-used difficulty as a non-binding hint.

### Accessibility and clarity

- Prefer **visible FABs** over hidden menus, `<details>`, or sheet-only flows for pass-and-play filters — larger touch targets, no discoverability step, `aria-pressed` on toggles.
- Setup screen keeps its Filters sheet for round-wide settings (generations, card types, multi-pack); play screen handles **per-card** difficulty only.

### Setup screen

- Unchanged: round filters remain in the setup Filters FAB / desktop `<details>` — those define the card pool; play FABs narrow **this** card.

## Alternatives considered

- **Keep Pick card sheet** — rejected; hidden behind extra tap, poor for pass-and-play.
- **Multi-select difficulty FABs per draw** — rejected; single difficulty per turn is easier to explain (“tap how hard you want it”).
- **Auto-reveal last difficulty without a tap** — rejected; each actor must consciously choose before seeing the card.

## Consequences

**Good:**

- Filters are always visible during play; no sheet to discover
- Reveal gating prevents accidental peek before difficulty is chosen
- Persisted hint speeds repeat players without skipping the tap

**Bad / tradeoffs:**

- More vertical space on small phones (fixed filter bar above dock)
- `CharadesPickCardPanel` is unused on play (kept for now; can delete later)
- Desktop and mobile share one filter component with responsive positioning

**Follow-ups:**

- Optional curator mode for Giphy pins (separate backlog)
- Consider quick difficulty FABs on setup if setup filters sheet remains confusing

## Links

- Play filter component: `packages/charades/src/components/CharadesPlayFilterFabs.tsx`
- Persistence hook: `packages/charades/src/hooks/useCharadesPlayPick.ts`
- E2E: `packages/game-hub/test/e2e/charades.spec.ts`
