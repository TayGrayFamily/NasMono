import type { CardType, Difficulty, Generation } from '../types.js';
import { CARD_TYPE_LABELS } from '../lib/cardTypes.js';
import {
  ALL_DIFFICULTIES,
  ANY_DIFFICULTY,
  DIFFICULTY_LABELS,
  isAllDifficultiesSelection,
} from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import { ALL_GENERATIONS, GENERATION_LABELS } from '../lib/generations.js';

interface CharadesFiltersPanelProps {
  multiPack: boolean;
  setMultiPackMode: (enabled: boolean) => void;
  enabledDifficulties: Difficulty[];
  availableDifficulties: Difficulty[];
  selectDifficulty: (choice: DifficultyChoice) => void;
  enabledGenerations: Generation[];
  toggleGeneration: (generation: Generation) => void;
  availableTypes: CardType[];
  enabledTypes: CardType[];
  toggleType: (type: CardType) => void;
  showPackFilters: boolean;
}

export function CharadesFiltersPanel({
  multiPack,
  setMultiPackMode,
  enabledDifficulties,
  availableDifficulties,
  selectDifficulty,
  enabledGenerations,
  toggleGeneration,
  availableTypes,
  enabledTypes,
  toggleType,
  showPackFilters,
}: CharadesFiltersPanelProps) {
  const allSelected = isAllDifficultiesSelection(enabledDifficulties, availableDifficulties);
  const singleSelected = enabledDifficulties.length === 1 ? enabledDifficulties[0] : undefined;

  return (
    <div className="charades-filters__body">
      <div className="charades-filters__group">
        <h4 className="charades-filters__label">Mix packs</h4>
        <p className="charades-filter-hint">
          Turn on to combine cards from multiple packs in one round.
        </p>
        <button
          type="button"
          className={`charades-toggle-filter charades-toggle-filter--compact charades-toggle-filter--switch ${multiPack ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
          onClick={() => setMultiPackMode(!multiPack)}
          aria-pressed={multiPack}
        >
          <span className="charades-toggle-filter__label">
            {multiPack ? 'Multi-pack on' : 'Multi-pack off'}
          </span>
        </button>
      </div>

      <div className="charades-filters__group">
        <h4 className="charades-filters__label">Difficulty</h4>
        <p className="charades-filter-hint">
          Pick one level for the round, or Any for all levels in your selected pack
          {availableDifficulties.length < ALL_DIFFICULTIES.length
            ? ' (some levels unavailable)'
            : ''}
          .
        </p>
        <div className="charades-difficulty" role="group" aria-label="Difficulty">
          <button
            type="button"
            className={`charades-difficulty__btn charades-difficulty__btn--all ${allSelected ? 'charades-difficulty__btn--selected' : ''}`}
            onClick={() => selectDifficulty(ANY_DIFFICULTY)}
            aria-pressed={allSelected}
            disabled={availableDifficulties.length === 0}
          >
            Any
          </button>
          {ALL_DIFFICULTIES.map((level) => {
            const available = availableDifficulties.includes(level);
            const selected = !allSelected && singleSelected === level;
            return (
              <button
                key={level}
                type="button"
                className={`charades-difficulty__btn charades-difficulty__btn--${level} ${selected ? 'charades-difficulty__btn--selected' : ''}`}
                onClick={() => selectDifficulty(level)}
                aria-pressed={selected}
                disabled={!available}
              >
                {DIFFICULTY_LABELS[level]}
              </button>
            );
          })}
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
