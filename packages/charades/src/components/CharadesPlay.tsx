import { useCallback, useEffect, useRef, useState, type TransitionEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameToolbar } from 'game-ui';
import { ANY_DIFFICULTY } from '../lib/difficulties.js';
import type { DifficultyChoice } from '../lib/difficulties.js';
import type { CharadesCard } from '../types.js';
import { CardFace } from './CardFace.js';
import { CharadesPlayFooter } from './CharadesPlayFooter.js';
import { clearPlayPick, useCharadesPlayPick } from '../hooks/useCharadesPlayPick.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import { charadesGameMeta } from '../gameMeta.js';
import './charades.css';

const CONTENT_FADE_MS = 220;
const DEAL_PARK_MS = 540;
const DEAL_IN_MS = 680;
const FLIP_ANIMATION_MS = 520;

type DealPhase = 'idle' | 'in' | 'park';

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
  const [dealPhase, setDealPhase] = useState<DealPhase>('idle');
  const [completedCards, setCompletedCards] = useState<CharadesCard[]>([]);
  const [parkingCard, setParkingCard] = useState<CharadesCard | null>(null);
  const [isDealing, setIsDealing] = useState(false);
  const closingTurnRef = useRef(false);
  const dealTimersRef = useRef<number[]>([]);

  const clearDealTimers = useCallback(() => {
    dealTimersRef.current.forEach((id) => window.clearTimeout(id));
    dealTimersRef.current = [];
  }, []);

  const scheduleDeal = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    dealTimersRef.current.push(id);
  }, []);

  useEffect(() => clearDealTimers, [clearDealTimers]);

  const startDealIn = useCallback(() => {
    setDealPhase('in');
    scheduleDeal(() => setDealPhase('idle'), DEAL_IN_MS);
  }, [scheduleDeal]);

  const drawNextCard = useCallback(
    (exitCard: CharadesCard) => {
      clearDealTimers();
      setIsDealing(true);
      hideCard();

      setParkingCard(exitCard);
      setDealPhase('park');

      scheduleDeal(() => {
        setParkingCard(null);
        setCompletedCards((prev) => [...prev, exitCard]);
        setDealPhase('idle');
        advanceDeck();
        resetForNextTurn();
        pickNextCard(buildPick());
        markCardDrawn();
        setTurn((t) => t + 1);
        startDealIn();
        scheduleDeal(() => setIsDealing(false), DEAL_IN_MS);
      }, DEAL_PARK_MS);
    },
    [
      clearDealTimers,
      hideCard,
      scheduleDeal,
      advanceDeck,
      resetForNextTurn,
      pickNextCard,
      buildPick,
      markCardDrawn,
      startDealIn,
    ],
  );

  const dealFreshCard = useCallback(() => {
    pickNextCard(buildPick());
    markCardDrawn();
    startDealIn();
  }, [pickNextCard, buildPick, markCardDrawn, startDealIn]);

  const handleRevealCard = useCallback(() => {
    setContentVisible(false);
    reveal();
    scheduleDeal(() => {
      if (!closingTurnRef.current) setContentVisible(true);
    }, FLIP_ANIMATION_MS);
  }, [reveal, scheduleDeal]);

  const handleDone = useCallback(() => {
    if (!currentCard || isDealing) return;

    closingTurnRef.current = true;
    setContentVisible(false);

    scheduleDeal(() => {
      drawNextCard(currentCard);
      closingTurnRef.current = false;
    }, CONTENT_FADE_MS);
  }, [currentCard, drawNextCard, isDealing, scheduleDeal]);

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
    dealFreshCard();
  }, [isReady, revealed, cardDrawn, hasDifficultySelected, turn, dealFreshCard]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (revealed) handleDone();
        else if (cardDrawn && !isDealing) handleRevealCard();
      }
      if (event.code === 'ArrowRight' && revealed) {
        event.preventDefault();
        handleDone();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed, cardDrawn, isDealing, handleRevealCard, handleDone]);

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
      startDealIn();
    },
    [
      selectPickDifficulty,
      cardDrawn,
      pickNextCard,
      showPackPick,
      pickPackIds,
      enabledPackIds.length,
      markCardDrawn,
      startDealIn,
    ],
  );

  const handleEndRound = () => {
    clearSessionConfig();
    clearPlayPick();
    navigate('/play/charades');
  };

  useGameToolbar(charadesGameMeta.name, isReady ? roundTitle : undefined);

  if (!isReady || !currentCard || !config) {
    return null;
  }

  const canReveal = cardDrawn && !revealed && !isDealing;
  const awaitingDraw = !cardDrawn && !revealed;
  const activeDealPhase = dealPhase === 'idle' ? undefined : dealPhase;

  return (
    <div className="charades-page charades-play charades-page--play-footer">
      <div className="charades-page__body">
        <div className="charades-page__stage">
          <div className="card-deck">
            {completedCards.map((card, index) => (
              <CardFace
                key={`done-${card.id}`}
                card={card}
                revealed
                contentVisible
                parked
                dealPhase="parked"
                parkStackIndex={index}
              />
            ))}
            {parkingCard ? (
              <CardFace
                key={`park-${parkingCard.id}`}
                card={parkingCard}
                revealed
                contentVisible={false}
                dealPhase="park"
                parkStackIndex={completedCards.length}
              />
            ) : (
              <CardFace
                key={currentCard.id}
                card={currentCard}
                revealed={revealed}
                contentVisible={contentVisible}
                dealPhase={activeDealPhase}
                awaitingDraw={awaitingDraw}
                onReveal={canReveal ? handleRevealCard : undefined}
                onTransitionEnd={handleCardTransitionEnd}
              />
            )}
          </div>
        </div>

        <p className="charades-play-filters__prompt" id="charades-play-filter-prompt">
          {awaitingDraw
            ? 'Open filters to pick a difficulty, then reveal your card'
            : revealed
              ? 'Tap Done when the turn is over'
              : 'Reveal the card when the actor has the phone'}
        </p>
      </div>

      <CharadesPlayFooter
        revealed={revealed}
        canReveal={canReveal}
        enabledDifficulties={config.enabledDifficulties}
        pickDifficulty={pickDifficulty}
        showPackPick={showPackPick}
        sessionPacks={sessionPacks}
        pickPackIds={pickPackIds}
        onSelectDifficulty={handleSelectDifficulty}
        onApplyPackFilters={applyPackFilters}
        onRevealCard={handleRevealCard}
        onDone={handleDone}
        onEndRound={handleEndRound}
      />
    </div>
  );
}
