import type { CharadesPack, Difficulty } from '../types.js';
import { ALL_DIFFICULTIES, DIFFICULTY_LABELS } from '../lib/difficulties.js';

interface CharadesPickCardPanelProps {
  enabledDifficulties: Difficulty[];
  pickDifficulties: Difficulty[];
  togglePickDifficulty: (level: Difficulty) => void;
  showPackFilters: boolean;
  sessionPacks: CharadesPack[];
  pickPackIds: string[];
  togglePickPack: (packId: string) => void;
}

export function CharadesPickCardPanel({
  enabledDifficulties,
  pickDifficulties,
  togglePickDifficulty,
  showPackFilters,
  sessionPacks,
  pickPackIds,
  togglePickPack,
}: CharadesPickCardPanelProps) {
  const difficultyOptions = ALL_DIFFICULTIES.filter((level) => enabledDifficulties.includes(level));

  return (
    <div className="charades-filters__body">
      <p className="charades-filter-hint">
        Narrow the next card by difficulty{showPackFilters ? ' or pack' : ''}. A random matching
        card from the remaining deck will be drawn.
      </p>

      <div className="charades-filters__group">
        <h4 className="charades-filters__label">Difficulty</h4>
        <div className="charades-difficulty" role="group" aria-label="Pick card difficulty">
          {difficultyOptions.map((level) => {
            const on = pickDifficulties.includes(level);
            return (
              <button
                key={level}
                type="button"
                className={`charades-difficulty__btn charades-difficulty__btn--${level} ${on ? 'charades-difficulty__btn--selected' : ''}`}
                onClick={() => togglePickDifficulty(level)}
                aria-pressed={on}
              >
                {DIFFICULTY_LABELS[level]}
              </button>
            );
          })}
        </div>
      </div>

      {showPackFilters && (
        <div className="charades-filters__group">
          <h4 className="charades-filters__label">Pack</h4>
          <div className="charades-toggle-filters" role="group" aria-label="Pick card pack">
            {sessionPacks.map((pack) => {
              const on = pickPackIds.includes(pack.id);
              return (
                <button
                  key={pack.id}
                  type="button"
                  className={`charades-toggle-filter charades-toggle-filter--compact ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                  onClick={() => togglePickPack(pack.id)}
                  aria-pressed={on}
                >
                  <span className="charades-toggle-filter__label">{pack.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
