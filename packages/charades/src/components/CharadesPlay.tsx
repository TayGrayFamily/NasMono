import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANY_DIFFICULTY } from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import { CardFace } from './CardFace.js';
import { CharadesPlayFooter } from './CharadesPlayFooter.js';
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
    pickDifficulty,
    pickPackIds,
    togglePickPack,
    selectPickDifficulty,
    buildPick,
    cardDrawn,
    resetForNextTurn,
    markCardDrawn,
    hasDifficultySelected,
  } = useCharadesPlayPick(enabledPackIds, showPackPick, config?.enabledDifficulties ?? []);

  const [turn, setTurn] = useState(0);

  const handleNextCard = useCallback(() => {
    nextCard();
    resetForNextTurn();
    setTurn((t) => t + 1);
  }, [nextCard, resetForNextTurn]);

  const redrawCard = useCallback(() => {
    pickNextCard(buildPick());
    markCardDrawn();
  }, [pickNextCard, buildPick, markCardDrawn]);

  const handleFlipCard = useCallback(() => {
    reveal();
  }, [reveal]);

  useEffect(() => {
    if (!isReady || revealed || cardDrawn || !hasDifficultySelected) return;
    redrawCard();
  }, [isReady, revealed, cardDrawn, hasDifficultySelected, turn, redrawCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (revealed) handleNextCard();
        else if (cardDrawn) handleFlipCard();
      }
      if (event.code === 'ArrowRight' && revealed) {
        event.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, cardDrawn, handleFlipCard, handleNextCard]);

  useEffect(() => {
    if (!isReady) {
      navigate('/play/charades', { replace: true });
    }
  }, [isReady, navigate]);

  const handleSelectDifficulty = useCallback(
    (choice: DifficultyChoice) => {
      selectPickDifficulty(choice);
      if (cardDrawn) return;
      pickNextCard({
        difficulties: choice === ANY_DIFFICULTY ? [] : [choice],
        packIds: showPackPick && pickPackIds.length < enabledPackIds.length ? pickPackIds : [],
      });
      markCardDrawn();
    },
    [
      selectPickDifficulty,
      cardDrawn,
      pickNextCard,
      showPackPick,
      pickPackIds,
      enabledPackIds.length,
      markCardDrawn,
    ],
  );

  const handleEndRound = () => {
    clearSessionConfig();
    clearPlayPick();
    navigate('/play/charades');
  };

  if (!isReady || !currentCard || !config) {
    return null;
  }

  const canFlip = cardDrawn && !revealed;
  const awaitingDraw = !cardDrawn && !revealed;

  return (
    <div className="charades-page charades-play charades-page--play-footer">
      <div className="charades-page__body">
        <header className="charades-header charades-header--toolbar">
          <h2 className="charades-header__title">{roundTitle}</h2>
        </header>

        <div className="charades-page__stage">
          <CardFace
            card={currentCard}
            revealed={revealed}
            awaitingDraw={awaitingDraw}
            onReveal={canFlip ? handleFlipCard : undefined}
          />
        </div>

        <p className="charades-play-filters__prompt" id="charades-play-filter-prompt">
          {awaitingDraw
            ? 'Open filters to pick a difficulty, then flip your card'
            : revealed
              ? 'Tap Done when the turn is over'
              : 'Tap Flip card or the card back when the actor has the phone'}
        </p>
      </div>

      <CharadesPlayFooter
        revealed={revealed}
        canFlip={canFlip}
        enabledDifficulties={config.enabledDifficulties}
        pickDifficulty={pickDifficulty}
        showPackPick={showPackPick}
        sessionPacks={sessionPacks}
        pickPackIds={pickPackIds}
        onSelectDifficulty={handleSelectDifficulty}
        onTogglePack={togglePickPack}
        onFlipCard={handleFlipCard}
        onDone={handleNextCard}
        onEndRound={handleEndRound}
      />
    </div>
  );
}
