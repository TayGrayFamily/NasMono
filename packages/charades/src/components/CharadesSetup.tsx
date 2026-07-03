import React from 'react';
import { useNavigate } from 'react-router-dom';
import { allPacks } from '../data/index.js';
import type { Difficulty } from '../types.js';
import { CARD_TYPE_LABELS } from '../lib/cardTypes.js';
import { useCharadesSetup } from '../hooks/useCharadesSession.js';
import './charades.css';

const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

function formatAgeRange(ageMin: number, ageMax: number | null): string {
  if (ageMax === null) return `Ages ${ageMin}+`;
  return `Ages ${ageMin}–${ageMax}`;
}

export function CharadesSetup() {
  const navigate = useNavigate();
  const {
    packId,
    setPackId,
    difficulty,
    setDifficulty,
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

  const showTypeFilters = availableTypes.length > 1;

  return (
    <div className="charades-page">
      <header className="charades-header">
        <button type="button" className="charades-header__back" onClick={() => navigate('/')}>
          ← Back to games
        </button>
        <h2 className="charades-header__title">Charades</h2>
        <p className="charades-header__subtitle">
          Pick a pack, difficulty, and card types. Pass the phone to act it out.
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
              <h4 className="charades-pack-card__name">{pack.name}</h4>
              <p className="charades-pack-card__desc">{pack.description}</p>
              <span className="charades-pack-card__age">
                {formatAgeRange(pack.ageMin, pack.ageMax)}
              </span>
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

      {showTypeFilters && (
        <section>
          <h3 className="charades-section-title">Card types</h3>
          <p className="charades-type-hint">
            Turn off anything your group does not want — skip actors, quotes, or titles. At least
            one type must stay on.
          </p>
          <div className="charades-type-filters" role="group" aria-label="Card types">
            {availableTypes.map((type) => {
              const on = enabledTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  className={`charades-type-filter ${on ? 'charades-type-filter--on' : 'charades-type-filter--off'}`}
                  onClick={() => toggleType(type)}
                  aria-pressed={on}
                >
                  {CARD_TYPE_LABELS[type]}
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
