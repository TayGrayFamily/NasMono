import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { allPacks } from '../data/index.js';
import type { Difficulty } from '../types.js';
import { ALL_GENERATIONS, GENERATION_LABELS } from '../lib/generations.js';
import { useCharadesSetup } from '../hooks/useCharadesSession.js';
import { CharadesFiltersPanel } from './CharadesFiltersPanel.js';
import './charades.css';

function formatDifficulty(level: Difficulty): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function CharadesSetup() {
  const navigate = useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
    packId,
    setPackId,
    difficulty,
    setDifficulty,
    enabledGenerations,
    toggleGeneration,
    availableTypes,
    enabledTypes,
    toggleType,
    filteredCount,
    canStart,
    startSession,
  } = useCharadesSetup();

  const showPackFilters = availableTypes.length > 1;

  const filterSummary = useMemo(() => {
    const difficultyLabel = formatDifficulty(difficulty);
    const generationLabel =
      enabledGenerations.length === ALL_GENERATIONS.length
        ? 'All players'
        : enabledGenerations.map((g) => GENERATION_LABELS[g]).join(', ');
    return `${difficultyLabel} · ${generationLabel}`;
  }, [difficulty, enabledGenerations]);

  const handleStart = () => {
    const config = startSession();
    if (config) {
      navigate('/play/charades/game');
    }
  };

  const filterPanel = (
    <CharadesFiltersPanel
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      enabledGenerations={enabledGenerations}
      toggleGeneration={toggleGeneration}
      availableTypes={availableTypes}
      enabledTypes={enabledTypes}
      toggleType={toggleType}
      showPackFilters={showPackFilters}
    />
  );

  return (
    <div className="charades-page charades-setup charades-page--fab">
      <div className="charades-page__body">
        <header className="charades-header">
          <button type="button" className="charades-header__back" onClick={() => navigate('/')}>
            ← Back to games
          </button>
          <h2 className="charades-header__title">Charades</h2>
          <p className="charades-header__subtitle">
            Pick a pack, adjust filters if needed, then start the round.
          </p>
        </header>

        <section>
          <h3 className="charades-section-title">Choose a pack</h3>
          <div className="charades-pack-grid">
            {allPacks.map((pack) => (
              <button
                key={pack.id}
                type="button"
                className={`charades-pack-card ${packId === pack.id ? 'charades-pack-card--selected' : ''}`}
                onClick={() => setPackId(pack.id)}
                aria-pressed={packId === pack.id}
              >
                <span className="charades-pack-card__name">{pack.name}</span>
                <span className="charades-pack-card__desc">{pack.description}</span>
              </button>
            ))}
          </div>
        </section>

        <details className="charades-filters charades-filters--desktop">
          <summary className="charades-filters__summary">
            <span className="charades-filters__title">Filters</span>
            <span className="charades-filters__value">{filterSummary}</span>
          </summary>
          {filterPanel}
        </details>

        {packId && (
          <p className="charades-meta" aria-live="polite">
            {filteredCount} cards in this round
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

      <div className="charades-fab-dock" aria-label="Round actions">
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
          {packId ? `Start · ${filteredCount}` : 'Start'}
        </button>
      </div>

      {filtersOpen && (
        <div className="charades-sheet" role="dialog" aria-modal="true" aria-label="Round filters">
          <button
            type="button"
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
