# Charades (solo PoC)

Client-side charades card picker for Game Hub.

- **Solo / pass-and-play:** `/play/charades` — no login or lobby required
- **Data:** hardcoded packs in `src/data/` (16 packs)
- **Generation filter:** optional “Who is playing?” toggles (Gen Alpha, Gen Z, Millennials, Gen X+); all on by default
- **Pack filters:** optional card-type toggles when a pack has multiple types (e.g. Movies actors/quotes)
- **Multi-pack:** optional Filters toggle to mix cards from multiple packs in one round
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

| Field                     | Purpose                                                                    |
| ------------------------- | -------------------------------------------------------------------------- |
| `context`                 | Source or background (film, era) — **Context** chip                        |
| `guessHint`               | Softer nudge for stuck guessers — **Hint** chip                            |
| `definition`              | Short definition for terms/places — **Definition** chip                    |
| `emoji`                   | Quick visual on the card face                                              |
| `imageUrl`                | Bundled or resolved still image                                            |
| `giphyId` / `imageSearch` | Loads a still from Giphy when `VITE_GIPHY_API_KEY` is set — **Image** chip |

Legacy `actHint` on quotes still maps to **Context**. Acting instructions come from card type (e.g. “Mouth the line silently”).

Universal packs (animals, actions, etc.) omit `generations` and suit every player. Other packs fall back to difficulty-based defaults when `generations` is omitted — prefer setting it explicitly on pop-culture cards.

Mobile layout is tested at **iPhone 13 Pro Max** portrait and landscape (see root `AGENTS.md` → Mobile UI testing); CSS must work in both orientations.
