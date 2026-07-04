import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardFace } from './CardFace.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import './charades.css';

export function CharadesPlay() {
  const navigate = useNavigate();
  const { roundTitle, currentCard, revealed, reveal, nextCard, isReady } = useCharadesPlay();

  useEffect(() => {
    if (!isReady) {
      navigate('/play/charades', { replace: true });
    }
  }, [isReady, navigate]);

  const handleEndRound = () => {
    clearSessionConfig();
    navigate('/play/charades');
  };

  if (!isReady || !currentCard) {
    return null;
  }

  const primaryLabel = revealed ? 'Next card' : 'Reveal';
  const primaryAction = revealed ? nextCard : reveal;

  return (
    <div className="charades-page charades-play charades-page--fab">
      <div className="charades-page__body">
        <header className="charades-header">
          <h2 className="charades-header__title">{roundTitle}</h2>
          <p className="charades-header__subtitle">Act it out. Others guess.</p>
        </header>

        <CardFace card={currentCard} revealed={revealed} />

        <footer className="charades-action-bar charades-action-bar--play charades-action-bar--desktop">
          {!revealed ? (
            <button type="button" className="charades-btn-primary" onClick={reveal}>
              Reveal
            </button>
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
    </div>
  );
}
