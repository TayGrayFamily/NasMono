import { useId, useState } from 'react';
import type { CharadesPack, Difficulty } from '../types.js';
import {
  ALL_DIFFICULTIES,
  ANY_DIFFICULTY,
  ANY_DIFFICULTY_LABEL,
  DIFFICULTY_LABELS,
} from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';

type FilterPanel = 'difficulty' | 'pack';

interface CharadesPlayFooterProps {
  revealed: boolean;
  canFlip: boolean;
  enabledDifficulties: Difficulty[];
  pickDifficulty: DifficultyChoice | null;
  showPackPick: boolean;
  sessionPacks: CharadesPack[];
  pickPackIds: string[];
  onSelectDifficulty: (choice: DifficultyChoice) => void;
  onTogglePack: (packId: string) => void;
  onFlipCard: () => void;
  onDone: () => void;
  onEndRound: () => void;
}

function FilterIcon() {
  return (
    <svg
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function CharadesPlayFooter({
  revealed,
  canFlip,
  enabledDifficulties,
  pickDifficulty,
  showPackPick,
  sessionPacks,
  pickPackIds,
  onSelectDifficulty,
  onTogglePack,
  onFlipCard,
  onDone,
  onEndRound,
}: CharadesPlayFooterProps) {
  const listId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<FilterPanel | null>(null);

  const levelOptions = ALL_DIFFICULTIES.filter((level) => enabledDifficulties.includes(level));
  const showAny = enabledDifficulties.length > 1;
  const categories: FilterPanel[] = showPackPick ? ['difficulty', 'pack'] : ['difficulty'];
  const showCategories = categories.length > 1 && activePanel === null;
  const showDifficultyOptions =
    activePanel === 'difficulty' || (filtersOpen && categories.length === 1);
  const showPackOptions = activePanel === 'pack';

  const closeFilters = () => {
    setFiltersOpen(false);
    setActivePanel(null);
  };

  const toggleFilters = () => {
    if (filtersOpen) {
      closeFilters();
      return;
    }
    setFiltersOpen(true);
    setActivePanel(categories.length === 1 ? 'difficulty' : null);
  };

  const handleSelectDifficulty = (choice: DifficultyChoice) => {
    onSelectDifficulty(choice);
    closeFilters();
  };

  if (revealed) {
    return (
      <footer className="charades-play-footer" aria-label="Card actions">
        <button type="button" className="charades-play-footer__done" onClick={onDone}>
          Done
        </button>
      </footer>
    );
  }

  return (
    <footer
      className={`charades-play-footer${filtersOpen ? ' charades-play-footer--filters-open' : ''}`}
      aria-label="Card actions"
    >
      {filtersOpen && (
        <button
          type="button"
          className="charades-play-footer__backdrop"
          aria-label="Close filters"
          onClick={closeFilters}
        />
      )}

      <div className="charades-play-footer__filters">
        <button
          type="button"
          className={`charades-play-footer__filter-trigger${filtersOpen ? ' charades-play-footer__filter-trigger--open' : ''}`}
          aria-expanded={filtersOpen}
          aria-haspopup="true"
          aria-controls={listId}
          aria-label="Filters"
          onClick={toggleFilters}
        >
          <FilterIcon />
        </button>

        {filtersOpen && (
          <div
            id={listId}
            className="charades-play-footer__expand"
            role="group"
            aria-label="Filters"
          >
            {showCategories &&
              categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className="charades-play-footer__category"
                  onClick={() => setActivePanel(category)}
                >
                  {category === 'difficulty' ? 'Difficulty' : 'Pack'}
                </button>
              ))}

            {showDifficultyOptions && (
              <div className="charades-play-footer__options" role="listbox" aria-label="Difficulty">
                {showAny && (
                  <button
                    type="button"
                    role="option"
                    aria-selected={pickDifficulty === ANY_DIFFICULTY}
                    className={`charades-play-footer__option charades-play-footer__option--any ${pickDifficulty === ANY_DIFFICULTY ? 'charades-play-footer__option--selected' : ''}`}
                    onClick={() => handleSelectDifficulty(ANY_DIFFICULTY)}
                  >
                    {ANY_DIFFICULTY_LABEL}
                  </button>
                )}
                {levelOptions.map((level) => {
                  const isSelected = pickDifficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={`charades-play-footer__option charades-play-footer__option--${level} ${isSelected ? 'charades-play-footer__option--selected' : ''}`}
                      onClick={() => handleSelectDifficulty(level)}
                    >
                      {DIFFICULTY_LABELS[level]}
                    </button>
                  );
                })}
              </div>
            )}

            {showPackOptions && (
              <div className="charades-play-footer__options" role="group" aria-label="Pack">
                {sessionPacks.map((pack) => {
                  const on = pickPackIds.includes(pack.id);
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      className={`charades-play-footer__option charades-play-footer__option--pack ${on ? 'charades-play-footer__option--selected' : ''}`}
                      aria-pressed={on}
                      onClick={() => onTogglePack(pack.id)}
                    >
                      {pack.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <button type="button" className="charades-play-footer__end" onClick={onEndRound}>
        End round
      </button>

      <button
        type="button"
        className="charades-play-footer__flip"
        onClick={onFlipCard}
        disabled={!canFlip}
      >
        Flip card
      </button>
    </footer>
  );
}
