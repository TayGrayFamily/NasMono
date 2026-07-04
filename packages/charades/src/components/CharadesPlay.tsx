import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty } from '../types.js';
import { CardFace } from './CardFace.js';
import { CharadesPlayFilterFabs } from './CharadesPlayFilterFabs.js';
import { clearPlayPick, useCharadesPlayPick } from '../hooks/useCharadesPlayPick.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import './charades.css';

export function CharadesPlay() {
  const navigate = useNavigate();
  const {
    config,
    roundTitle,
    sessionPacks,
    currentCard,
    revealed,
    reveal,
    nextCard,
    pickNextCard,
    isReady,
  } = useCharadesPlay();

  const showPackPick = Boolean(config?.multiPack && config.packIds.length > 1);
  const enabledPackIds = config?.packIds ?? [];

  const {
    activeDifficulty,
    suggestedDifficulty,
    pickPackIds,
    togglePickPack,
    selectDifficulty,
    cardDrawn,
    resetForNextTurn,
  } = useCharadesPlayPick(enabledPackIds, showPackPick);

  const handleNextCard = useCallback(() => {
    nextCard();
    resetForNextTurn();
  }, [nextCard, resetForNextTurn]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (revealed) handleNextCard();
        else if (cardDrawn) reveal();
      }
      if (event.code === 'ArrowRight' && revealed) {
        event.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, cardDrawn, reveal, handleNextCard]);

  useEffect(() => {
    if (!isReady) {
      navigate('/play/charades', { replace: true });
    }
  }, [isReady, navigate]);

  const handleSelectDifficulty = useCallback(
    (level: Difficulty) => {
      const pick = selectDifficulty(level);
      pickNextCard(pick);
    },
    [selectDifficulty, pickNextCard],
  );

  const handleEndRound = () => {
    clearSessionConfig();
    clearPlayPick();
    navigate('/play/charades');
  };

  if (!isReady || !currentCard || !config) {
    return null;
  }

  const canReveal = cardDrawn && !revealed;
  const primaryLabel = revealed ? 'Next card' : 'Reveal';
  const primaryAction = revealed ? handleNextCard : reveal;
  const primaryDisabled = !revealed && !canReveal;

  return (
    <div className="charades-page charades-play charades-page--fab charades-page--play-filters">
      <div className="charades-page__body">
        <header className="charades-header">
          <h2 className="charades-header__title">{roundTitle}</h2>
          <p className="charades-header__subtitle">Act it out. Others guess.</p>
        </header>

        <CardFace card={currentCard} revealed={revealed} awaitingDraw={!cardDrawn && !revealed} />

        {!revealed && (
          <CharadesPlayFilterFabs
            enabledDifficulties={config.enabledDifficulties}
            activeDifficulty={activeDifficulty}
            suggestedDifficulty={suggestedDifficulty}
            onSelectDifficulty={handleSelectDifficulty}
            cardDrawn={cardDrawn}
            showPackPick={showPackPick}
            sessionPacks={sessionPacks}
            pickPackIds={pickPackIds}
            onTogglePack={togglePickPack}
          />
        )}

        <footer className="charades-action-bar charades-action-bar--play charades-action-bar--desktop">
          {!revealed ? (
            <button
              type="button"
              className="charades-btn-primary"
              onClick={reveal}
              disabled={!canReveal}
            >
              Reveal
            </button>
          ) : (
            <button type="button" className="charades-btn-primary" onClick={handleNextCard}>
              Next card
            </button>
          )}
          <button type="button" className="charades-btn-ghost" onClick={handleEndRound}>
            End round
          </button>
        </footer>
      </div>

      <div className="charades-fab-dock" aria-label="Card actions">
        <button
          type="button"
          className="charades-fab charades-fab--secondary"
          onClick={handleEndRound}
        >
          End round
        </button>
        <button
          type="button"
          className="charades-fab charades-fab--primary"
          onClick={primaryAction}
          disabled={primaryDisabled}
          aria-describedby={primaryDisabled ? 'charades-play-filter-prompt' : undefined}
        >
          {primaryLabel}
        </button>
      </div>
    </div>
  );
}
