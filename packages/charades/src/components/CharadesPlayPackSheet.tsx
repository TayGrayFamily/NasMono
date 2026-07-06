import type { CharadesPack } from '../types.js';
import { CharadesPickCardPanel } from './CharadesPickCardPanel.js';

interface CharadesPlayPackSheetProps {
  open: boolean;
  sessionPacks: CharadesPack[];
  draftPackIds: string[];
  onTogglePack: (packId: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function CharadesPlayPackSheet({
  open,
  sessionPacks,
  draftPackIds,
  onTogglePack,
  onClose,
  onSave,
}: CharadesPlayPackSheetProps) {
  if (!open) return null;

  return (
    <div
      className="charades-sheet charades-play-pack-sheet"
      role="dialog"
      aria-modal="true"
      aria-label="Pack filters"
    >
      <button
        type="button"
        className="charades-sheet__backdrop"
        aria-label="Close pack filters"
        onClick={onClose}
      />
      <div className="charades-play-pack-sheet__panel">
        <header className="charades-sheet__header">
          <div>
            <h3 className="charades-sheet__title">Pack</h3>
            <p className="charades-sheet__subtitle">Narrow the next card by pack</p>
          </div>
        </header>
        <CharadesPickCardPanel
          showPackFilters
          sessionPacks={sessionPacks}
          pickPackIds={draftPackIds}
          togglePickPack={onTogglePack}
        />
        <button type="button" className="charades-play-pack-sheet__save" onClick={onSave}>
          Save
        </button>
      </div>
    </div>
  );
}
