import { useCallback, useEffect, useRef, useState, type TransitionEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ANY_DIFFICULTY } from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import { CardFace } from './CardFace.js';
import { CharadesPlayFooter } from './CharadesPlayFooter.js';
import { clearPlayPick, useCharadesPlayPick } from '../hooks/useCharadesPlayPick.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import './charades.css';

const CONTENT_FADE_MS = 220;
const DEAL_ANIMATION_MS = 480;
const FLIP_ANIMATION_MS = 520;

export function CharadesPlay() {
  const navigate = useNavigate();
  const {
    config,
    roundTitle,
    sessionPacks,
    currentCard,
    revealed,
    reveal,
    hideCard,
    advanceDeck,
    pickNextCard,
    isReady,
  } = useCharadesPlay();

  const showPackPick = Boolean(config?.multiPack && config.packIds.length > 1);
  const enabledPackIds = config?.packIds ?? [];

  const {
    pickDifficulty,
    pickPackIds,
    selectPickDifficulty,
    buildPick,
    applyPackFilters,
    cardDrawn,
    resetForNextTurn,
    markCardDrawn,
    hasDifficultySelected,
  } = useCharadesPlayPick(enabledPackIds, showPackPick, config?.enabledDifficulties ?? []);

  const [turn, setTurn] = useState(0);
  const [contentVisible, setContentVisible] = useState(false);
  const [dealAnimating, setDealAnimating] = useState(false);
  const closingTurnRef = useRef(false);

  const startDealAnimation = useCallback(() => {
    setDealAnimating(true);
    window.setTimeout(() => setDealAnimating(false), DEAL_ANIMATION_MS);
  }, []);

  const handleNextTurn = useCallback(() => {
    advanceDeck();
    resetForNextTurn();
    setTurn((t) => t + 1);
  }, [advanceDeck, resetForNextTurn]);

  const redrawCard = useCallback(() => {
    pickNextCard(buildPick());
    markCardDrawn();
    startDealAnimation();
  }, [pickNextCard, buildPick, markCardDrawn, startDealAnimation]);

  const handleFlipCard = useCallback(() => {
    setContentVisible(false);
    reveal();
    window.setTimeout(() => {
      if (!closingTurnRef.current) setContentVisible(true);
    }, FLIP_ANIMATION_MS);
  }, [reveal]);

  const handleDone = useCallback(() => {
    closingTurnRef.current = true;
    setContentVisible(false);
    window.setTimeout(() => hideCard(), CONTENT_FADE_MS);
    window.setTimeout(
      () => {
        if (!closingTurnRef.current) return;
        closingTurnRef.current = false;
        handleNextTurn();
      },
      CONTENT_FADE_MS + FLIP_ANIMATION_MS + 40,
    );
  }, [hideCard, handleNextTurn]);

  const handleCardTransitionEnd = useCallback(
    (event: TransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (revealed && !closingTurnRef.current) {
        setContentVisible(true);
      }
    },
    [revealed],
  );

  useEffect(() => {
    if (!isReady || revealed || cardDrawn || !hasDifficultySelected) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional turn bootstrap
    redrawCard();
  }, [isReady, revealed, cardDrawn, hasDifficultySelected, turn, redrawCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (revealed) handleDone();
        else if (cardDrawn) handleFlipCard();
      }
      if (event.code === 'ArrowRight' && revealed) {
        event.preventDefault();
        handleDone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, cardDrawn, handleFlipCard, handleDone]);

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
      startDealAnimation();
    },
    [
      selectPickDifficulty,
      cardDrawn,
      pickNextCard,
      showPackPick,
      pickPackIds,
      enabledPackIds.length,
      markCardDrawn,
      startDealAnimation,
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
            contentVisible={contentVisible}
            dealAnimating={dealAnimating}
            awaitingDraw={awaitingDraw}
            onReveal={canFlip ? handleFlipCard : undefined}
            onTransitionEnd={handleCardTransitionEnd}
          />
        </div>

        <p className="charades-play-filters__prompt" id="charades-play-filter-prompt">
          {awaitingDraw
            ? 'Open filters to pick a difficulty, then flip your card'
            : revealed
              ? 'Tap Done when the turn is over'
              : 'Flip the card when the actor has the phone'}
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
        onApplyPackFilters={applyPackFilters}
        onFlipCard={handleFlipCard}
        onDone={handleDone}
        onEndRound={handleEndRound}
      />
    </div>
  );
}
