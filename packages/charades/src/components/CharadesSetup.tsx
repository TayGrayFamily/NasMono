import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { allPacks } from '../data/index.js';
import type { Difficulty } from '../types.js';
import { CARD_TYPE_LABELS } from '../lib/cardTypes.js';
import { ALL_GENERATIONS, GENERATION_LABELS } from '../lib/generations.js';
import { useCharadesSetup } from '../hooks/useCharadesSession.js';
import './charades.css';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

function formatDifficulty(level: Difficulty): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function CharadesSetup() {
  const navigate = useNavigate();
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

  return (
    <div className="charades-page charades-setup">
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

      <details className="charades-filters">
        <summary className="charades-filters__summary">
          <span className="charades-filters__title">Filters</span>
          <span className="charades-filters__value">{filterSummary}</span>
        </summary>

        <div className="charades-filters__body">
          <div className="charades-filters__group">
            <h4 className="charades-filters__label">Difficulty</h4>
            <div className="charades-difficulty" role="group" aria-label="Difficulty">
              {difficulties.map((level) => (
                <button
                  key={level}
                  type="button"
                  className={`charades-difficulty__btn ${difficulty === level ? 'charades-difficulty__btn--selected' : ''}`}
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                >
                  {formatDifficulty(level)}
                </button>
              ))}
            </div>
          </div>

          <div className="charades-filters__group">
            <h4 className="charades-filters__label">Who is playing?</h4>
            <p className="charades-filter-hint">
              All generations are on by default. Turn off any group that is not at the table.
            </p>
            <div className="charades-toggle-filters" role="group" aria-label="Generations playing">
              {ALL_GENERATIONS.map((generation) => {
                const on = enabledGenerations.includes(generation);
                return (
                  <button
                    key={generation}
                    type="button"
                    className={`charades-toggle-filter charades-toggle-filter--compact ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                    onClick={() => toggleGeneration(generation)}
                    aria-pressed={on}
                  >
                    <span className="charades-toggle-filter__label">
                      {GENERATION_LABELS[generation]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {showPackFilters && (
            <div className="charades-filters__group">
              <h4 className="charades-filters__label">Card types</h4>
              <p className="charades-filter-hint">
                Turn off card types you do not want. At least one type must stay on.
              </p>
              <div className="charades-toggle-filters" role="group" aria-label="Card types">
                {availableTypes.map((type) => {
                  const on = enabledTypes.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`charades-toggle-filter charades-toggle-filter--compact ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                      onClick={() => toggleType(type)}
                      aria-pressed={on}
                    >
                      <span className="charades-toggle-filter__label">{CARD_TYPE_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </details>

      {packId && (
        <p className="charades-meta" aria-live="polite">
          {filteredCount} cards in this round
        </p>
      )}

      <footer className="charades-action-bar">
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
  );
}
