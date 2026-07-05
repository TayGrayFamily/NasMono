import { useId } from 'react';
import type { Difficulty } from '../types.js';
import {
  ALL_DIFFICULTIES,
  ANY_DIFFICULTY,
  ANY_DIFFICULTY_LABEL,
  DIFFICULTY_LABELS,
  formatPickDifficultyLabel,
} from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';

interface CharadesDifficultyPickerProps {
  enabledDifficulties: Difficulty[];
  selected: DifficultyChoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (level: DifficultyChoice) => void;
}

export function CharadesDifficultyPicker({
  enabledDifficulties,
  selected,
  open,
  onOpenChange,
  onSelect,
}: CharadesDifficultyPickerProps) {
  const listId = useId();
  const levelOptions = ALL_DIFFICULTIES.filter((level) => enabledDifficulties.includes(level));
  const showAny = enabledDifficulties.length > 1;
  const primary = selected !== null && selected !== ANY_DIFFICULTY ? selected : undefined;
  const triggerLabel = formatPickDifficultyLabel(selected);

  return (
    <div
      className={`charades-difficulty-picker ${open ? 'charades-difficulty-picker--open' : ''} ${primary ? `charades-difficulty-picker--${primary}` : ''} ${selected === ANY_DIFFICULTY ? 'charades-difficulty-picker--any' : ''}`}
    >
      {open && (
        <button
          type="button"
          className="charades-difficulty-picker__backdrop"
          aria-label="Close difficulty options"
          onClick={() => onOpenChange(false)}
        />
      )}

      <div
        id={listId}
        className="charades-difficulty-picker__options"
        role="listbox"
        aria-label="Difficulty"
        hidden={!open}
      >
        {showAny && (
          <button
            type="button"
            role="option"
            aria-selected={selected === ANY_DIFFICULTY}
            className={`charades-difficulty-picker__option charades-difficulty-picker__option--any ${selected === ANY_DIFFICULTY ? 'charades-difficulty-picker__option--selected' : ''}`}
            onClick={() => {
              onSelect(ANY_DIFFICULTY);
              onOpenChange(false);
            }}
          >
            {ANY_DIFFICULTY_LABEL}
          </button>
        )}
        {levelOptions.map((level) => {
          const isSelected = selected === level;
          return (
            <button
              key={level}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`charades-difficulty-picker__option charades-difficulty-picker__option--${level} ${isSelected ? 'charades-difficulty-picker__option--selected' : ''}`}
              onClick={() => {
                onSelect(level);
                onOpenChange(false);
              }}
            >
              {DIFFICULTY_LABELS[level]}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="charades-fab charades-fab--secondary charades-difficulty-picker__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => onOpenChange(!open)}
      >
        <span className="charades-fab__label">{triggerLabel}</span>
        <span className="charades-fab__hint">{selected === null ? 'Tap to choose' : 'Change'}</span>
      </button>
    </div>
  );
}
