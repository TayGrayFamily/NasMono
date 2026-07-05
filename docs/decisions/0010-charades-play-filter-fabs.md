# ADR-0010: Charades play-screen card filters

- **Status:** Accepted (amended 2026-07-05)
- **Date:** 2026-07-04
- **Scope:** packages/charades, game-hub

## Context

Solo / pass-and-play Charades asks each actor to pick a difficulty before revealing their card. The original **Pick card** bottom sheet hid filters behind an extra tap. A follow-up replaced it with always-visible difficulty FABs, but that removed **pack** and **multi-difficulty** narrowing on the play screen.

Goals:

- Obvious, tappable controls for all ages — no tutorial
- **Persist difficulty** between cards so repeat players are not forced to re-tap every turn
- Restore **Filters** sheet for pack and multi-difficulty (round setup filters stay separate)
- Reveal disabled until a card is drawn for the current turn

## Decision

### Play screen UX

- **Difficulty picker:** one FAB trigger that expands an animated list **upward** from the bottom dock. Selecting an option collapses the list and shows the choice on the trigger (green / yellow / red tint for Easy / Normal / Hard).
- **First card:** player must open Difficulty and pick a level; that draws a matching card immediately.
- **Subsequent cards:** last difficulty (and pack filters) persist in `sessionStorage` (`charades-play-pick`); the next card **auto-draws** at that difficulty when the turn advances — no extra tap unless the player changes difficulty.
- **Filters FAB:** opens a bottom sheet with `CharadesPickCardPanel` — multi-select difficulty and pack (multi-pack rounds). **Apply** redraws the current turn card and closes the sheet.
- **Reveal** stays disabled until a card is drawn for the current turn.
- **Card face** shows “Pick a difficulty first” only before the first draw of a turn; after auto-draw on later turns it shows “Card hidden”.

### Accessibility and clarity

- Difficulty trigger uses `aria-expanded`, `aria-haspopup="listbox"`, options use `role="option"`.
- Prefer a **visible Difficulty control** over hidden menus for the primary per-turn choice; secondary narrowing lives in the Filters sheet.
- Setup screen keeps its Filters sheet for round-wide settings (generations, card types, multi-pack).

### Setup screen

- Unchanged: round filters remain in the setup Filters FAB / desktop `<details>` — those define the card pool; play filters narrow **this** card.

## Alternatives considered

- **Keep three difficulty FABs always visible** — rejected; crowded on mobile and no room for pack filters without a second row.
- **Auto-reveal without any first-tap** — rejected for the first card; each session should start with a conscious difficulty choice.
- **Hide pack filters entirely on play** — rejected; multi-pack rounds need per-card pack narrowing.

## Consequences

**Good:**

- Difficulty persists across turns with automatic redraw
- Pack and multi-difficulty filters restored without sacrificing a simple primary control
- Animated expand/collapse keeps the dock compact

**Bad / tradeoffs:**

- Two controls (Difficulty + Filters) to learn, mitigated by hint text on each FAB
- Filters sheet changes reset `cardDrawn` until Apply — player must tap Apply to redraw
- Desktop and mobile share one picker with responsive positioning

**Follow-ups:**

- Optional curator mode for Giphy pins (separate backlog)

## Links

- Difficulty picker: `packages/charades/src/components/CharadesDifficultyPicker.tsx`
- Play screen: `packages/charades/src/components/CharadesPlay.tsx`
- Filters panel: `packages/charades/src/components/CharadesPickCardPanel.tsx`
- Persistence hook: `packages/charades/src/hooks/useCharadesPlayPick.ts`
- E2E: `packages/game-hub/test/e2e/charades.spec.ts`
