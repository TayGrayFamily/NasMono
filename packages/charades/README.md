# Charades (solo PoC)

Client-side charades card picker for Game Hub.

- **Solo / pass-and-play:** `/play/charades` — no login or lobby required
- **Data:** hardcoded packs in `src/data/` (16 packs, ~2,500+ cards)
- **Difficulty:** each card has a numeric level **1–10**; play filters use overlapping bands — Easy (1–4), Normal (4–7), Hard (7–10)
- **Generation filter:** optional “Who is playing?” toggles (Gen Alpha, Gen Z, Millennials, Gen X+) — all on by default
- **Pack filters:** optional card-type toggles when a pack has multiple types (e.g. Movies actors/quotes)
- **Multi-pack:** optional Filters toggle to mix cards from multiple packs in one round
- **Play filters:** always-visible difficulty FABs (Easy / Normal / Hard) — tap to draw, then Reveal; see [ADR-0010](../../docs/decisions/0010-charades-play-filter-fabs.md)
- **Future:** lobby multiplayer at `/lobbies/:id/game/charades` can reuse `CharadesPlay` with server-dealt cards

## Pack overview

| Pack                  | Types                                            |
| --------------------- | ------------------------------------------------ |
| Actions & Activities  | terms                                            |
| Animals               | words                                            |
| Around the House      | words, terms                                     |
| Disney & Family       | titles, characters, quotes                       |
| Emotions & Feelings   | words, terms                                     |
| Food & Drink          | words, terms                                     |
| Jobs & Professions    | terms                                            |
| Movies                | titles, quotes, characters, actors (toggle each) |
| Music                 | titles, people, words                            |
| Books & Stories       | titles, characters, people                       |
| Places & Landmarks    | words, terms                                     |
| Sports & Games        | words, terms, people                             |
| TV Shows              | titles, characters, quotes                       |
| Nintendo Games        | terms                                            |
| Video Game Characters | people                                           |
| Anime                 | titles, quotes, characters (toggle each)         |

Cards may include a `generations` array (who is likely to know the reference) and optional reveal extras:

| Field                     | Purpose                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------- |
| `context`                 | Source or background (film, era) — **Context** chip                                |
| `guessHint`               | Softer nudge for stuck guessers — **Hint** chip                                    |
| `definition`              | Short definition for terms/places — **Definition** chip                            |
| `emoji`                   | Quick visual on the card face                                                      |
| `imageUrl`                | Bundled static image                                                               |
| `giphyId` / `imageSearch` | Loads an animated GIF from Giphy when `VITE_GIPHY_API_KEY` is set — **Image** chip |

### Giphy images

Set `VITE_GIPHY_API_KEY` in the repo root `.env` (see `.env.example`). Restart `pnpm dev:game-hub` after changing it.

On Docker/Unraid, the same variable in your compose `.env` is injected at **container start** into `/env-config.js` — restart `game-hub` after updating.

**How Giphy search works (and how we query it):**

- The API takes one `q` string (max **50 characters**) — not separate tags. Giphy ranks results using titles, slugs, alt text, and popularity; we do not control their ranking.
- **Fewer, specific English words work better** than long titles or generic suffixes like `anime` (which matches any anime GIF, including the wrong show).
- Anime characters use **character + shortened series** (e.g. `Madoka Kaname Madoka Magica`, not `Puella Magi… anime`).
- We fetch 10 results and pick the one whose metadata best matches distinctive query terms; unrelated hits are rejected.

For stubborn cards, set an explicit `imageSearch` or pin a `giphyId`.

UI messages distinguish:

- **No key detected** — variable missing or server/container not restarted
- **Giphy rejected the API key** — key present but unauthorized (401/403)
- **No image found** — API succeeded but no match for this card
- **Could not reach Giphy** — network or other API error

Legacy `actHint` on quotes still maps to **Context**. Acting instructions come from card type (e.g. “Mouth the line silently”).

Universal packs (animals, actions, etc.) omit `generations` and suit every player. Other packs fall back to difficulty-based defaults when `generations` is omitted — prefer setting it explicitly on pop-culture cards.

### Difficulty scale

| Field / concept | Details                                                                 |
| --------------- | ----------------------------------------------------------------------- |
| `difficulty`    | Integer **1–10** on each card (validated by Zod)                        |
| Easy band       | Levels 1–4 (overlaps Normal at 4)                                       |
| Normal band     | Levels 4–7 (overlaps Easy at 4, Hard at 7)                              |
| Hard band       | Levels 7–10 (overlaps Normal at 7)                                      |
| UI colors       | Green → yellow → red gradient per level; band buttons use band midpoint |
| Setup stats     | Filter panel shows avg difficulty, histogram, and band share %          |

Bulk expansions live in `src/data/expansions/` — regenerate with `node packages/charades/scripts/generate-expansions.mjs`.

Mobile layout is tested at **iPhone 13 Pro Max** portrait and landscape (see root `AGENTS.md` → Mobile UI testing); CSS must work in both orientations.
