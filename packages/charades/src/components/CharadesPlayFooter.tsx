import { useId, useState } from 'react';
import type { CharadesPack, Difficulty } from '../types.js';
import {
  ALL_DIFFICULTIES,
  ANY_DIFFICULTY,
  ANY_DIFFICULTY_LABEL,
  DIFFICULTY_LABELS,
} from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import { CharadesPlayPackSheet } from './CharadesPlayPackSheet.js';

interface CharadesPlayFooterProps {
  revealed: boolean;
  canReveal: boolean;
  enabledDifficulties: Difficulty[];
  pickDifficulty: DifficultyChoice | null;
  showPackPick: boolean;
  sessionPacks: CharadesPack[];
  pickPackIds: string[];
  onSelectDifficulty: (choice: DifficultyChoice) => void;
  onApplyPackFilters: (packIds: string[]) => void;
  onRevealCard: () => void;
  onDone: () => void;
  onEndRound: () => void;
  remainingCount: number;
}

function FilterIcon() {
  return (
    <svg
      className="charades-play-footer__filter-icon"
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3 5a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6l-5.2 6.93V18a1 1 0 0 1-.55.9l-4 2A1 1 0 0 1 10 20v-6.47L4.2 5.6A1 1 0 0 1 5 4h14Z" />
    </svg>
  );
}

export function CharadesPlayFooter({
  revealed,
  canReveal,
  enabledDifficulties,
  pickDifficulty,
  showPackPick,
  sessionPacks,
  pickPackIds,
  onSelectDifficulty,
  onApplyPackFilters,
  onRevealCard,
  onDone,
  onEndRound,
  remainingCount,
}: CharadesPlayFooterProps) {
  const listId = useId();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showDifficultyOptions, setShowDifficultyOptions] = useState(false);
  const [packSheetOpen, setPackSheetOpen] = useState(false);
  const [packDraftIds, setPackDraftIds] = useState<string[]>(pickPackIds);

  const levelOptions = ALL_DIFFICULTIES.filter((level) => enabledDifficulties.includes(level));
  const showAny = enabledDifficulties.length > 1;
  const showCategories = showPackPick && filtersOpen && !showDifficultyOptions;

  const closeFilters = () => {
    setFiltersOpen(false);
    setShowDifficultyOptions(false);
  };

  const toggleFilters = () => {
    if (filtersOpen) {
      closeFilters();
      return;
    }
    setFiltersOpen(true);
    setShowDifficultyOptions(!showPackPick);
  };

  const handleSelectDifficulty = (choice: DifficultyChoice) => {
    onSelectDifficulty(choice);
    closeFilters();
  };

  const openPackSheet = () => {
    closeFilters();
    setPackDraftIds(pickPackIds);
    setPackSheetOpen(true);
  };

  const toggleDraftPack = (packId: string) => {
    setPackDraftIds((prev) => {
      if (prev.includes(packId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== packId);
      }
      return [...prev, packId];
    });
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
    <>
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

        <div className="charades-play-footer__row">
          <div className="charades-play-footer__filters">
            {filtersOpen && (
              <div
                id={listId}
                className="charades-play-footer__popup"
                role="group"
                aria-label="Filters"
              >
                {showCategories && (
                  <>
                    <button
                      type="button"
                      className="charades-play-footer__category"
                      onClick={() => setShowDifficultyOptions(true)}
                    >
                      Difficulty
                    </button>
                    <button
                      type="button"
                      className="charades-play-footer__category"
                      onClick={openPackSheet}
                    >
                      Pack
                    </button>
                  </>
                )}

                {showDifficultyOptions && (
                  <div
                    className="charades-play-footer__options"
                    role="listbox"
                    aria-label="Difficulty"
                  >
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
              </div>
            )}

            <button
              type="button"
              className={`charades-play-footer__filter-trigger${filtersOpen ? ' charades-play-footer__filter-trigger--open' : ''}`}
              aria-expanded={filtersOpen}
              aria-haspopup="true"
              aria-controls={listId}
              title="Filters"
              onClick={toggleFilters}
            >
              <FilterIcon />
              <span className="charades-play-footer__filter-label">Filters</span>
            </button>
          </div>

          <button type="button" className="charades-play-footer__end" onClick={onEndRound}>
            End round
          </button>

          <span className="charades-play-footer__remaining" aria-live="polite">
            {remainingCount} left
          </span>

          <button
            type="button"
            className="charades-play-footer__flip"
            onClick={onRevealCard}
            disabled={!canReveal}
          >
            Reveal
          </button>
        </div>
      </footer>

      <CharadesPlayPackSheet
        open={packSheetOpen}
        sessionPacks={sessionPacks}
        draftPackIds={packDraftIds}
        onTogglePack={toggleDraftPack}
        onClose={() => setPackSheetOpen(false)}
        onSave={() => {
          onApplyPackFilters(packDraftIds);
          setPackSheetOpen(false);
        }}
      />
    </>
  );
}
