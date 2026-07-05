import { useId } from 'react';
import type { Difficulty } from '../types.js';
import {
  ALL_DIFFICULTIES,
  DIFFICULTY_LABELS,
  formatDifficultySummary,
} from '../lib/difficulties.js';

interface CharadesDifficultyPickerProps {
  enabledDifficulties: Difficulty[];
  selected: Difficulty[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (level: Difficulty) => void;
}

export function CharadesDifficultyPicker({
  enabledDifficulties,
  selected,
  open,
  onOpenChange,
  onSelect,
}: CharadesDifficultyPickerProps) {
  const listId = useId();
  const options = ALL_DIFFICULTIES.filter((level) => enabledDifficulties.includes(level));
  const primary = selected.length === 1 ? selected[0] : undefined;
  const triggerLabel =
    selected.length === 0
      ? 'Difficulty'
      : selected.length === 1
        ? DIFFICULTY_LABELS[selected[0]]
        : formatDifficultySummary(selected);

  return (
    <div
      className={`charades-difficulty-picker ${open ? 'charades-difficulty-picker--open' : ''} ${primary ? `charades-difficulty-picker--${primary}` : ''}`}
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
        {options.map((level) => {
          const isSelected = selected.includes(level);
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
        <span className="charades-fab__hint">
          {selected.length === 0 ? 'Tap to choose' : 'Change'}
        </span>
      </button>
    </div>
  );
}
