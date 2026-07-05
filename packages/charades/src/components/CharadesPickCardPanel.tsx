import type { CharadesPack } from '../types.js';

interface CharadesPickCardPanelProps {
  showPackFilters: boolean;
  sessionPacks: CharadesPack[];
  pickPackIds: string[];
  togglePickPack: (packId: string) => void;
}

export function CharadesPickCardPanel({
  showPackFilters,
  sessionPacks,
  pickPackIds,
  togglePickPack,
}: CharadesPickCardPanelProps) {
  if (!showPackFilters) {
    return (
      <div className="charades-filters__body">
        <p className="charades-filter-hint">
          No extra filters for this round. Use Difficulty below to choose how hard the next card
          should be.
        </p>
      </div>
    );
  }

  return (
    <div className="charades-filters__body">
      <p className="charades-filter-hint">
        Narrow the next card by pack. A random matching card from the remaining deck will be drawn.
      </p>

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
    </div>
  );
}
