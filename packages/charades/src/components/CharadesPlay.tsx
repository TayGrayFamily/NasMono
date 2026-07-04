import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardFace } from './CardFace.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import './charades.css';

export function CharadesPlay() {
  const navigate = useNavigate();
  const { pack, currentCard, revealed, reveal, nextCard, isReady } = useCharadesPlay();

  useEffect(() => {
    if (!isReady) {
      navigate('/play/charades', { replace: true });
    }
  }, [isReady, navigate]);

  const handleEndRound = () => {
    clearSessionConfig();
    navigate('/play/charades');
  };

  if (!isReady || !pack) {
    return null;
  }

  return (
    <div className="charades-page charades-play">
      <header className="charades-header">
        <h2 className="charades-header__title">{pack.name}</h2>
        <p className="charades-header__subtitle">Act it out. Others guess.</p>
      </header>

      <CardFace card={currentCard} revealed={revealed} />

      <footer className="charades-action-bar charades-action-bar--play">
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
  );
}
