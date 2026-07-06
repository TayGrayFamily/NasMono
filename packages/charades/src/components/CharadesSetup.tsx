import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameToolbar } from 'game-ui';
import { allPacks } from '../data/index.js';
import { formatDifficultySummary } from '../lib/difficulties.js';
import { averageDifficulty, bandSharePercent } from '../lib/difficultyBands.js';
import { ALL_GENERATIONS, GENERATION_LABELS } from '../lib/generations.js';
import { useCharadesSetup } from '../hooks/useCharadesSession.js';
import { charadesGameMeta } from '../gameMeta.js';
import { CharadesFiltersPanel } from './CharadesFiltersPanel.js';
import './charades.css';

export function CharadesSetup() {
  const navigate = useNavigate();
  useGameToolbar(charadesGameMeta.name);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    multiPack,
    setMultiPackMode,
    selectedPackIds,
    handlePackPress,
    enabledDifficulties,
    availableDifficulties,
    toggleDifficulty,
    enabledGenerations,
    toggleGeneration,
    availableTypes,
    enabledTypes,
    toggleType,
    filteredCount,
    filteredCards,
    canStart,
    startSession,
  } = useCharadesSetup();

  const showPackFilters = availableTypes.length > 1;

  const filterSummary = useMemo(() => {
    const difficultyLabel = formatDifficultySummary(enabledDifficulties, availableDifficulties);
    const generationLabel =
      enabledGenerations.length === ALL_GENERATIONS.length
        ? 'All players'
        : enabledGenerations.map((g) => GENERATION_LABELS[g]).join(', ');
    const mixLabel = multiPack ? 'Multi-pack' : 'Single pack';
    return `${mixLabel} · ${difficultyLabel} · ${generationLabel}`;
  }, [multiPack, enabledDifficulties, availableDifficulties, enabledGenerations]);

  const handleStart = () => {
    const config = startSession();
    if (config) {
      navigate('/play/charades/game');
    }
  };

  const filterPanel = (
    <CharadesFiltersPanel
      multiPack={multiPack}
      setMultiPackMode={setMultiPackMode}
      enabledDifficulties={enabledDifficulties}
      availableDifficulties={availableDifficulties}
      selectDifficulty={toggleDifficulty}
      enabledGenerations={enabledGenerations}
      toggleGeneration={toggleGeneration}
      availableTypes={availableTypes}
      enabledTypes={enabledTypes}
      toggleType={toggleType}
      showPackFilters={showPackFilters}
      filteredCards={filteredCards}
    />
  );

  return (
    <div
      className={`charades-page charades-setup charades-page--fab${filtersOpen ? ' charades-page--sheet-open' : ''}`}
    >
      <div className="charades-page__body">
        <div className="charades-page__scroll">
          <p className="charades-setup-hint">
            {multiPack
              ? 'Turn on multi-pack in Filters, then choose the packs to mix.'
              : 'Pick a pack, adjust filters if needed, then start the round.'}
          </p>
          <section>
            <h3 className="charades-section-title">
              {multiPack ? 'Choose packs to mix' : 'Choose a pack'}
            </h3>
            <div
              className={`charades-pack-grid${multiPack ? ' charades-pack-grid--multi' : ''}`}
              role={multiPack ? 'group' : undefined}
              aria-label={multiPack ? 'Packs to mix' : undefined}
            >
              {allPacks.map((pack) => {
                const selected = selectedPackIds.includes(pack.id);
                const packAvg = averageDifficulty(pack.cards);
                return (
                  <button
                    key={pack.id}
                    type="button"
                    className={`charades-pack-card ${selected ? 'charades-pack-card--selected' : ''}`}
                    onClick={() => handlePackPress(pack.id)}
                    aria-pressed={selected}
                  >
                    <span className="charades-pack-card__name">{pack.name}</span>
                    <span className="charades-pack-card__desc">{pack.description}</span>
                    <span className="charades-pack-card__stats">
                      {pack.cards.length} cards · avg {packAvg?.toFixed(1) ?? '—'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <details className="charades-filters charades-filters--desktop">
            <summary className="charades-filters__summary">
              <span className="charades-filters__title">Filters</span>
              <span className="charades-filters__value">{filterSummary}</span>
            </summary>
            {filterPanel}
          </details>

          {selectedPackIds.length > 0 && (
            <p className="charades-meta" aria-live="polite">
              {filteredCount} cards in this round
              {filteredCount > 0 && (
                <span className="charades-meta__shares">
                  {' '}
                  · avg {averageDifficulty(filteredCards)?.toFixed(1)} · Easy{' '}
                  {bandSharePercent(filteredCards, 'easy')}% · Normal{' '}
                  {bandSharePercent(filteredCards, 'medium')}% · Hard{' '}
                  {bandSharePercent(filteredCards, 'hard')}%
                </span>
              )}
              {multiPack && selectedPackIds.length > 1 ? ` · ${selectedPackIds.length} packs` : ''}
            </p>
          )}

          <footer className="charades-action-bar charades-action-bar--desktop">
            <button
              type="button"
              className="charades-btn-primary"
              disabled={!canStart}
              onClick={handleStart}
            >
              Start
            </button>
          </footer>
        </div>
      </div>

      <div className="charades-fab-dock charades-fab-dock--setup" aria-label="Round actions">
        <button
          type="button"
          className="charades-fab charades-fab--secondary"
          aria-expanded={filtersOpen}
          aria-haspopup="dialog"
          onClick={() => setFiltersOpen(true)}
        >
          <span className="charades-fab__label">Filters</span>
          <span className="charades-fab__hint">{filterSummary}</span>
        </button>
        <button
          type="button"
          className="charades-fab charades-fab--primary"
          disabled={!canStart}
          onClick={handleStart}
        >
          {selectedPackIds.length > 0 ? `Start · ${filteredCount}` : 'Start'}
        </button>
      </div>

      {filtersOpen && (
        <div className="charades-sheet" role="dialog" aria-modal="true" aria-label="Round filters">
          <div
            role="button"
            tabIndex={-1}
            className="charades-sheet__backdrop"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="charades-sheet__panel">
            <header className="charades-sheet__header">
              <div>
                <h3 className="charades-sheet__title">Filters</h3>
                <p className="charades-sheet__subtitle">{filterSummary}</p>
              </div>
              <button
                type="button"
                className="charades-sheet__done"
                onClick={() => setFiltersOpen(false)}
              >
                Done
              </button>
            </header>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
