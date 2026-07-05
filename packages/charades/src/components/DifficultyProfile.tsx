import type { CharadesCard } from '../types.js';
import {
  averageDifficulty,
  bandSharePercent,
  cardMatchesBand,
  difficultyHistogram,
} from '../lib/difficultyBands.js';
import type { DifficultyBand } from '../lib/difficultyBands.js';
import { getDifficultyColor } from '../lib/difficultyColors.js';

interface DifficultyProfileProps {
  cards: readonly Pick<CharadesCard, 'difficulty'>[];
  selectedBand?: DifficultyBand | null;
  showBandShares?: boolean;
  compact?: boolean;
}

export function DifficultyProfile({
  cards,
  selectedBand = null,
  showBandShares = true,
  compact = false,
}: DifficultyProfileProps) {
  const avg = averageDifficulty(cards);
  const histogram = difficultyHistogram(cards);
  const maxCount = Math.max(1, ...histogram);
  const subsetAvg =
    selectedBand && selectedBand !== null
      ? averageDifficulty(cards.filter((c) => cardMatchesBand(c, selectedBand)))
      : null;

  if (cards.length === 0) {
    return (
      <p className="charades-difficulty-profile charades-difficulty-profile--empty">
        No cards match current filters.
      </p>
    );
  }

  const bandLabel =
    selectedBand === 'medium'
      ? 'Normal'
      : selectedBand
        ? selectedBand.charAt(0).toUpperCase() + selectedBand.slice(1)
        : null;

  return (
    <div
      className={`charades-difficulty-profile${compact ? ' charades-difficulty-profile--compact' : ''}`}
    >
      <div className="charades-difficulty-profile__header">
        <span className="charades-difficulty-profile__avg">Avg {avg?.toFixed(1) ?? '—'}</span>
        {subsetAvg !== null && bandLabel && (
          <span className="charades-difficulty-profile__subset">
            {bandLabel} subset avg {subsetAvg.toFixed(1)}
          </span>
        )}
      </div>

      <div
        className="charades-difficulty-profile__histogram"
        role="img"
        aria-label={`Difficulty distribution for ${cards.length} cards, average ${avg}`}
      >
        {histogram.map((count, index) => {
          const level = index + 1;
          const height = count === 0 ? 0 : Math.max(12, Math.round((count / maxCount) * 100));
          return (
            <span
              key={level}
              className="charades-difficulty-profile__bar"
              style={{
                height: `${height}%`,
                backgroundColor: getDifficultyColor(level),
                opacity: count === 0 ? 0.2 : 1,
              }}
              title={`Level ${level}: ${count} cards`}
            />
          );
        })}
      </div>

      {showBandShares && !compact && (
        <p className="charades-difficulty-profile__shares">
          Easy {bandSharePercent(cards, 'easy')}% · Normal {bandSharePercent(cards, 'medium')}% ·
          Hard {bandSharePercent(cards, 'hard')}%
        </p>
      )}
    </div>
  );
}
