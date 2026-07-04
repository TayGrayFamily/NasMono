# Charades (solo PoC)

Client-side charades card picker for Game Hub.

- **Solo / pass-and-play:** `/play/charades` — no login or lobby required
- **Data:** hardcoded packs in `src/data/` (16 packs)
- **Generation filter:** optional “Who is playing?” toggles (Gen Alpha, Gen Z, Millennials, Gen X+); all on by default
- **Pack filters:** optional card-type toggles when a pack has multiple types (e.g. Movies actors/quotes)
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
| Anime Characters      | people                                           |

Cards may include a `generations` array. When omitted, universal packs (animals, actions, etc.) suit every generation; pop-culture packs infer generations from `year` and difficulty at load time.
