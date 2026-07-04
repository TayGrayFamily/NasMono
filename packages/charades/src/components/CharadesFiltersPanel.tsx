import type { CardType, Difficulty, Generation } from '../types.js';
import { CARD_TYPE_LABELS } from '../lib/cardTypes.js';
import { ALL_GENERATIONS, GENERATION_LABELS } from '../lib/generations.js';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

function formatDifficulty(level: Difficulty): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

interface CharadesFiltersPanelProps {
  difficulty: Difficulty;
  setDifficulty: (level: Difficulty) => void;
  enabledGenerations: Generation[];
  toggleGeneration: (generation: Generation) => void;
  availableTypes: CardType[];
  enabledTypes: CardType[];
  toggleType: (type: CardType) => void;
  showPackFilters: boolean;
}

export function CharadesFiltersPanel({
  difficulty,
  setDifficulty,
  enabledGenerations,
  toggleGeneration,
  availableTypes,
  enabledTypes,
  toggleType,
  showPackFilters,
}: CharadesFiltersPanelProps) {
  return (
    <div className="charades-filters__body">
      <div className="charades-filters__group">
        <h4 className="charades-filters__label">Difficulty</h4>
        <div className="charades-difficulty" role="group" aria-label="Difficulty">
          {difficulties.map((level) => (
            <button
              key={level}
              type="button"
              className={`charades-difficulty__btn ${difficulty === level ? 'charades-difficulty__btn--selected' : ''}`}
              onClick={() => setDifficulty(level)}
              aria-pressed={difficulty === level}
            >
              {formatDifficulty(level)}
            </button>
          ))}
        </div>
      </div>

      <div className="charades-filters__group">
        <h4 className="charades-filters__label">Who is playing?</h4>
        <p className="charades-filter-hint">
          All generations are on by default. Turn off any group that is not at the table.
        </p>
        <div className="charades-toggle-filters" role="group" aria-label="Generations playing">
          {ALL_GENERATIONS.map((generation) => {
            const on = enabledGenerations.includes(generation);
            return (
              <button
                key={generation}
                type="button"
                className={`charades-toggle-filter charades-toggle-filter--compact ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                onClick={() => toggleGeneration(generation)}
                aria-pressed={on}
              >
                <span className="charades-toggle-filter__label">
                  {GENERATION_LABELS[generation]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {showPackFilters && (
        <div className="charades-filters__group">
          <h4 className="charades-filters__label">Card types</h4>
          <p className="charades-filter-hint">
            Turn off card types you do not want. At least one type must stay on.
          </p>
          <div className="charades-toggle-filters" role="group" aria-label="Card types">
            {availableTypes.map((type) => {
              const on = enabledTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`charades-toggle-filter charades-toggle-filter--compact ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                  onClick={() => toggleType(type)}
                  aria-pressed={on}
                >
                  <span className="charades-toggle-filter__label">{CARD_TYPE_LABELS[type]}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
