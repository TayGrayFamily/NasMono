import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty } from '../types.js';
import { formatDifficultySummary } from '../lib/difficulties.js';
import { CardFace } from './CardFace.js';
import { CharadesDifficultyPicker } from './CharadesDifficultyPicker.js';
import { CharadesPickCardPanel } from './CharadesPickCardPanel.js';
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
    pickDifficulties,
    pickPackIds,
    togglePickDifficulty,
    togglePickPack,
    setSingleDifficulty,
    buildPick,
    applyFilters,
    cardDrawn,
    resetForNextTurn,
    markCardDrawn,
    hasDifficultySelected,
  } = useCharadesPlayPick(enabledPackIds, showPackPick, config?.enabledDifficulties ?? []);

  const [difficultyOpen, setDifficultyOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  useEffect(() => {
    if (!isReady || revealed || cardDrawn || !hasDifficultySelected) return;
    redrawCard();
  }, [isReady, revealed, cardDrawn, hasDifficultySelected, turn, redrawCard]);

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
      setSingleDifficulty(level);
      pickNextCard({
        difficulties: [level],
        packIds: showPackPick && pickPackIds.length < enabledPackIds.length ? pickPackIds : [],
      });
      markCardDrawn();
    },
    [
      setSingleDifficulty,
      pickNextCard,
      showPackPick,
      pickPackIds,
      enabledPackIds.length,
      markCardDrawn,
    ],
  );

  const handleApplyFilters = useCallback(() => {
    pickNextCard(applyFilters());
    markCardDrawn();
    setFiltersOpen(false);
  }, [applyFilters, pickNextCard, markCardDrawn]);

  const handleEndRound = () => {
    clearSessionConfig();
    clearPlayPick();
    navigate('/play/charades');
  };

  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    const enabledCount = config?.enabledDifficulties.length ?? 3;
    if (pickDifficulties.length > 0 && pickDifficulties.length < enabledCount) {
      parts.push(formatDifficultySummary(pickDifficulties));
    }
    if (showPackPick && pickPackIds.length > 0 && pickPackIds.length < enabledPackIds.length) {
      const names = sessionPacks
        .filter((pack) => pickPackIds.includes(pack.id))
        .map((pack) => pack.name);
      parts.push(names.join(', '));
    }
    return parts.length > 0 ? parts.join(' · ') : 'All cards';
  }, [
    pickDifficulties,
    pickPackIds,
    showPackPick,
    config?.enabledDifficulties,
    enabledPackIds,
    sessionPacks,
  ]);

  if (!isReady || !currentCard || !config) {
    return null;
  }

  const canReveal = cardDrawn && !revealed;
  const primaryLabel = revealed ? 'Next card' : 'Reveal';
  const primaryAction = revealed ? handleNextCard : reveal;
  const primaryDisabled = !revealed && !canReveal;
  const awaitingDraw = !cardDrawn && !revealed;

  return (
    <div
      className={`charades-page charades-play charades-page--fab charades-page--play-filters${difficultyOpen || filtersOpen ? ' charades-page--sheet-open' : ''}`}
    >
      <div className="charades-page__body">
        <header className="charades-header">
          <h2 className="charades-header__title">{roundTitle}</h2>
          <p className="charades-header__subtitle">Act it out. Others guess.</p>
        </header>

        <div className="charades-page__stage">
          <CardFace card={currentCard} revealed={revealed} awaitingDraw={awaitingDraw} />
        </div>

        <p className="charades-play-filters__prompt" id="charades-play-filter-prompt">
          {awaitingDraw
            ? 'Choose a difficulty below, then reveal your card'
            : revealed
              ? 'Tap Next card when ready for the next player'
              : 'Ready — tap Reveal when the actor has the phone'}
        </p>

        <div className="charades-play-dock-controls charades-play-dock-controls--desktop">
          <CharadesDifficultyPicker
            enabledDifficulties={config.enabledDifficulties}
            selected={pickDifficulties}
            open={difficultyOpen}
            onOpenChange={setDifficultyOpen}
            onSelect={handleSelectDifficulty}
          />
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
        </div>

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

      <div className="charades-fab-dock charades-fab-dock--play" aria-label="Card actions">
        <div className="charades-fab-dock__pickers">
          <CharadesDifficultyPicker
            enabledDifficulties={config.enabledDifficulties}
            selected={pickDifficulties}
            open={difficultyOpen}
            onOpenChange={setDifficultyOpen}
            onSelect={handleSelectDifficulty}
          />
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
        </div>
        <div className="charades-fab-dock__actions">
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

      {filtersOpen && (
        <div className="charades-sheet" role="dialog" aria-modal="true" aria-label="Card filters">
          <button
            type="button"
            className="charades-sheet__backdrop"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="charades-sheet__panel">
            <header className="charades-sheet__header">
              <div>
                <h3 className="charades-sheet__title">Card filters</h3>
                <p className="charades-sheet__subtitle">{filterSummary}</p>
              </div>
              <button type="button" className="charades-sheet__done" onClick={handleApplyFilters}>
                Apply
              </button>
            </header>
            <CharadesPickCardPanel
              enabledDifficulties={config.enabledDifficulties}
              pickDifficulties={pickDifficulties}
              togglePickDifficulty={togglePickDifficulty}
              showPackFilters={showPackPick}
              sessionPacks={sessionPacks}
              pickPackIds={pickPackIds}
              togglePickPack={togglePickPack}
            />
          </div>
        </div>
      )}
    </div>
  );
}
