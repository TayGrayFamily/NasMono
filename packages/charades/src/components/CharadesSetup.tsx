import React from 'react';
import { useNavigate } from 'react-router-dom';
import { allPacks } from '../data/index.js';
import type { Difficulty } from '../types.js';
import { CARD_TYPE_LABELS } from '../lib/cardTypes.js';
import { ALL_GENERATIONS, GENERATION_HINTS, GENERATION_LABELS } from '../lib/generations.js';
import { useCharadesSetup } from '../hooks/useCharadesSession.js';
import './charades.css';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

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

  const handleStart = () => {
    const config = startSession();
    if (config) {
      navigate('/play/charades/game');
    }
  };

  const showPackFilters = availableTypes.length > 1;

  return (
    <div className="charades-page">
      <header className="charades-header">
        <button type="button" className="charades-header__back" onClick={() => navigate('/')}>
          ← Back to games
        </button>
        <h2 className="charades-header__title">Charades</h2>
        <p className="charades-header__subtitle">
          Choose who is playing, pick a pack, and pass the phone to act it out.
        </p>
      </header>

      <section>
        <h3 className="charades-section-title">Who is playing?</h3>
        <p className="charades-filter-hint">
          Optional — all generations are on by default. Turn off any group that is not at the table.
        </p>
        <div className="charades-toggle-filters" role="group" aria-label="Generations playing">
          {ALL_GENERATIONS.map((generation) => {
            const on = enabledGenerations.includes(generation);
            return (
              <button
                key={generation}
                type="button"
                className={`charades-toggle-filter ${on ? 'charades-toggle-filter--on' : 'charades-toggle-filter--off'}`}
                onClick={() => toggleGeneration(generation)}
                aria-pressed={on}
                title={GENERATION_HINTS[generation]}
              >
                <span className="charades-toggle-filter__label">
                  {GENERATION_LABELS[generation]}
                </span>
                <span className="charades-toggle-filter__hint">{GENERATION_HINTS[generation]}</span>
              </button>
            );
          })}
        </div>
      </section>

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
              <h4 className="charades-pack-card__name">{pack.name}</h4>
              <p className="charades-pack-card__desc">{pack.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="charades-section-title">Difficulty</h3>
        <div className="charades-difficulty" role="group" aria-label="Difficulty">
          {difficulties.map((level) => (
            <button
              key={level}
              type="button"
              className={`charades-difficulty__btn ${difficulty === level ? 'charades-difficulty__btn--selected' : ''}`}
              onClick={() => setDifficulty(level)}
              aria-pressed={difficulty === level}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {showPackFilters && (
        <section>
          <h3 className="charades-section-title">Pack filters</h3>
          <p className="charades-filter-hint">
            Optional — turn off card types you do not want, such as actors or quotes. At least one
            type must stay on.
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
        </section>
      )}

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
