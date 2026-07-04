import type { Difficulty } from '../types.js';
import type { CharadesPack } from '../types.js';
import { DIFFICULTY_LABELS } from '../lib/difficulties.js';
import { ALL_DIFFICULTIES } from '../lib/difficulties.js';

interface CharadesPlayFilterFabsProps {
  enabledDifficulties: Difficulty[];
  activeDifficulty: Difficulty | null;
  suggestedDifficulty?: Difficulty;
  onSelectDifficulty: (level: Difficulty) => void;
  cardDrawn: boolean;
  showPackPick: boolean;
  sessionPacks: CharadesPack[];
  pickPackIds: string[];
  onTogglePack: (packId: string) => void;
}

export function CharadesPlayFilterFabs({
  enabledDifficulties,
  activeDifficulty,
  suggestedDifficulty,
  onSelectDifficulty,
  cardDrawn,
  showPackPick,
  sessionPacks,
  pickPackIds,
  onTogglePack,
}: CharadesPlayFilterFabsProps) {
  const difficultyOptions = ALL_DIFFICULTIES.filter((level) =>
    enabledDifficulties.includes(level),
  );

  return (
    <div className="charades-play-filters" role="region" aria-label="Choose card difficulty">
      <p className="charades-play-filters__prompt" id="charades-play-filter-prompt">
        {cardDrawn
          ? 'Ready — tap Reveal when the actor has the phone'
          : 'Tap Easy, Normal, or Hard to draw your card'}
      </p>

      <div className="charades-play-filters__difficulty" role="group" aria-labelledby="charades-play-filter-prompt">
        {difficultyOptions.map((level) => {
          const label = DIFFICULTY_LABELS[level];
          const isActive = activeDifficulty === level;
          const isSuggested = !cardDrawn && suggestedDifficulty === level;
          return (
            <button
              key={level}
              type="button"
              className={`charades-filter-fab charades-filter-fab--difficulty charades-filter-fab--${level} ${isActive ? 'charades-filter-fab--active' : ''} ${isSuggested && !isActive ? 'charades-filter-fab--suggested' : ''}`}
              aria-pressed={isActive}
              aria-label={`Draw ${label} card`}
              onClick={() => onSelectDifficulty(level)}
            >
              {label}
            </button>
          );
        })}
      </div>

      {showPackPick && sessionPacks.length > 1 && (
        <div className="charades-play-filters__packs" role="group" aria-label="Choose pack">
          <span className="charades-play-filters__packs-label">Pack</span>
          {sessionPacks.map((pack) => {
            const on = pickPackIds.includes(pack.id);
            return (
              <button
                key={pack.id}
                type="button"
                className={`charades-filter-fab charades-filter-fab--pack ${on ? 'charades-filter-fab--active' : ''}`}
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
  );
}
