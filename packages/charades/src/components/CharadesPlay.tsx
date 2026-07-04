import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Difficulty } from '../types.js';
import { formatDifficultySummary } from '../lib/difficulties.js';
import { CardFace } from './CardFace.js';
import { CharadesPickCardPanel } from './CharadesPickCardPanel.js';
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

  const [pickOpen, setPickOpen] = useState(false);
  const [pickDifficulties, setPickDifficulties] = useState<Difficulty[]>([]);
  const [pickPackIds, setPickPackIds] = useState<string[]>([]);

  const showPackPick = Boolean(config?.multiPack && config.packIds.length > 1);

  useEffect(() => {
    if (!config) return;
    setPickDifficulties([...config.enabledDifficulties]);
    setPickPackIds([...config.packIds]);
  }, [config]);

  useEffect(() => {
    if (!isReady) {
      navigate('/play/charades', { replace: true });
    }
  }, [isReady, navigate]);

  const pickSummary = useMemo(() => {
    const parts: string[] = [];
    if (pickDifficulties.length > 0) {
      parts.push(formatDifficultySummary(pickDifficulties));
    }
    if (showPackPick && pickPackIds.length > 0 && pickPackIds.length < config!.packIds.length) {
      const names = sessionPacks
        .filter((pack) => pickPackIds.includes(pack.id))
        .map((pack) => pack.name);
      parts.push(names.join(', '));
    }
    return parts.length > 0 ? parts.join(' · ') : 'Any card';
  }, [pickDifficulties, pickPackIds, showPackPick, config, sessionPacks]);

  const togglePickDifficulty = useCallback((level: Difficulty) => {
    setPickDifficulties((prev) => {
      if (prev.includes(level)) {
        if (prev.length <= 1) return prev;
        return prev.filter((item) => item !== level);
      }
      return [...prev, level];
    });
  }, []);

  const togglePickPack = useCallback((packId: string) => {
    setPickPackIds((prev) => {
      if (prev.includes(packId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== packId);
      }
      return [...prev, packId];
    });
  }, []);

  const handleApplyPick = () => {
    pickNextCard({
      difficulties: pickDifficulties,
      packIds: showPackPick ? pickPackIds : [],
    });
    setPickOpen(false);
  };

  const handleEndRound = () => {
    clearSessionConfig();
    navigate('/play/charades');
  };

  if (!isReady || !currentCard || !config) {
    return null;
  }

  const primaryLabel = revealed ? 'Next card' : 'Reveal';
  const primaryAction = revealed ? nextCard : reveal;

  const pickPanel = (
    <CharadesPickCardPanel
      enabledDifficulties={config.enabledDifficulties}
      pickDifficulties={pickDifficulties}
      togglePickDifficulty={togglePickDifficulty}
      showPackFilters={showPackPick}
      sessionPacks={sessionPacks}
      pickPackIds={pickPackIds}
      togglePickPack={togglePickPack}
    />
  );

  return (
    <div className="charades-page charades-play charades-page--fab">
      <div className="charades-page__body">
        <header className="charades-header">
          <h2 className="charades-header__title">{roundTitle}</h2>
          <p className="charades-header__subtitle">Act it out. Others guess.</p>
        </header>

        <CardFace card={currentCard} revealed={revealed} />

        {!revealed && (
          <div className="charades-pick-card-bar charades-pick-card-bar--desktop">
            <button
              type="button"
              className="charades-btn-ghost"
              onClick={() => setPickOpen(true)}
            >
              Pick card
            </button>
            <span className="charades-pick-card-bar__hint">{pickSummary}</span>
          </div>
        )}

        <footer className="charades-action-bar charades-action-bar--play charades-action-bar--desktop">
          {!revealed ? (
            <>
              <button type="button" className="charades-btn-ghost" onClick={() => setPickOpen(true)}>
                Pick card
              </button>
              <button type="button" className="charades-btn-primary" onClick={reveal}>
                Reveal
              </button>
            </>
          ) : (
            <button type="button" className="charades-btn-primary" onClick={nextCard}>
              Next card
            </button>
          )}
          <button type="button" className="charades-btn-ghost" onClick={handleEndRound}>
            End round
          </button>
        </footer>
      </div>

      <div className="charades-fab-dock" aria-label="Card actions">
        {!revealed && (
          <button
            type="button"
            className="charades-fab charades-fab--secondary"
            aria-expanded={pickOpen}
            aria-haspopup="dialog"
            onClick={() => setPickOpen(true)}
          >
            <span className="charades-fab__label">Pick card</span>
            <span className="charades-fab__hint">{pickSummary}</span>
          </button>
        )}
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
        >
          {primaryLabel}
        </button>
      </div>

      {pickOpen && (
        <div className="charades-sheet" role="dialog" aria-modal="true" aria-label="Pick next card">
          <button
            type="button"
            className="charades-sheet__backdrop"
            aria-label="Close pick card"
            onClick={() => setPickOpen(false)}
          />
          <div className="charades-sheet__panel">
            <header className="charades-sheet__header">
              <div>
                <h3 className="charades-sheet__title">Pick card</h3>
                <p className="charades-sheet__subtitle">{pickSummary}</p>
              </div>
              <button type="button" className="charades-sheet__done" onClick={handleApplyPick}>
                Draw
              </button>
            </header>
            {pickPanel}
          </div>
        </div>
      )}
    </div>
  );
}
