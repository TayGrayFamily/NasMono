import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardFace } from './CardFace.js';
import { clearSessionConfig, useCharadesPlay } from '../hooks/useCharadesSession.js';
import { useSwipeGesture } from '../hooks/useSwipeGesture.js';
import './charades.css';

function useIsMobile(): boolean {
  const [mobile, setMobile] = React.useState(() => window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return mobile;
}

export function CharadesPlay() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { pack, currentCard, revealed, reveal, nextCard, isReady } = useCharadesPlay();

  const { onPointerDown, onPointerUp } = useSwipeGesture({
    onSwipeLeft: revealed ? nextCard : undefined,
    onSwipeUp: revealed ? nextCard : undefined,
  });

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

      <CardFace
        card={currentCard}
        revealed={revealed}
        onReveal={reveal}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        showSwipeHint={isMobile && revealed}
      />

      <p className="charades-play__hint">
        {isMobile
          ? 'Tap to reveal. Swipe left or up for the next card.'
          : 'Click to reveal. Press Space or use the buttons below.'}
      </p>

      <footer className="charades-action-bar">
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
