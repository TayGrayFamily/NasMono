# Charades (solo PoC)

Client-side charades card picker for Game Hub.

- **Solo / pass-and-play:** `/play/charades` — no login or lobby required
- **Data:** hardcoded packs in `src/data/` (16 packs)
- **Card type toggles:** packs with multiple types (e.g. Movies) let you turn off actors, quotes, titles, or characters
- **Future:** lobby multiplayer at `/lobbies/:id/game/charades` can reuse `CharadesPlay` with server-dealt cards

## Pack overview

| Pack                  | Ages | Types                                            |
| --------------------- | ---- | ------------------------------------------------ |
| Actions & Activities  | 4+   | terms                                            |
| Animals               | 4+   | words                                            |
| Around the House      | 6+   | words, terms                                     |
| Disney & Family       | 4+   | titles, characters, quotes                       |
| Emotions & Feelings   | 4+   | words, terms                                     |
| Food & Drink          | 4+   | words, terms                                     |
| Jobs & Professions    | 5+   | terms                                            |
| Movies                | 8+   | titles, quotes, characters, actors (toggle each) |
| Music                 | 8+   | titles, people, words                            |
| Books & Stories       | 6+   | titles, characters, people                       |
| Places & Landmarks    | 8+   | words, terms                                     |
| Sports & Games        | 6+   | words, terms, people                             |
| TV Shows              | 10+  | titles, characters, quotes                       |
| Nintendo Games        | 6+   | terms                                            |
| Video Game Characters | 10+  | people                                           |
| Anime Characters      | 12+  | people                                           |
