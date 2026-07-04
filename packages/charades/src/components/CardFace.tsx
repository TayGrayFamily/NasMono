import React from 'react';
import type { CharadesCard } from '../types.js';
import { CARD_TYPE_PLAY_HINT, formatCardType } from '../lib/cardTypes.js';
import './CardFace.css';

interface CardFaceProps {
  card: CharadesCard | null;
  revealed: boolean;
  onReveal: () => void;
  onPointerDown?: (event: React.PointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: React.PointerEvent<HTMLElement>) => void;
  showSwipeHint?: boolean;
}

export function CardFace({
  card,
  revealed,
  onReveal,
  onPointerDown,
  onPointerUp,
  showSwipeHint = false,
}: CardFaceProps) {
  if (!card) {
    return (
      <div className="card-face card-face--empty">
        <p>No cards match your filters. End the round and adjust settings.</p>
      </div>
    );
  }

  const playHint = card.actHint ?? CARD_TYPE_PLAY_HINT[card.type];

  return (
    <button
      type="button"
      className={`card-face ${revealed ? 'card-face--revealed' : 'card-face--hidden'}`}
      onClick={revealed ? undefined : onReveal}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      aria-label={revealed ? `Charades card: ${card.text}` : 'Tap to reveal charades card'}
    >
      {revealed ? (
        <div className="card-face__content" aria-live="polite">
          <span className="card-face__type">{formatCardType(card.type)}</span>
          <p className="card-face__text">{card.text}</p>
          {playHint && <span className="card-face__hint">{playHint}</span>}
          {showSwipeHint && <span className="card-face__swipe-hint">Swipe for next card</span>}
        </div>
      ) : (
        <div className="card-face__cover">
          <span className="card-face__cover-icon" aria-hidden="true">
            ?
          </span>
          <p className="card-face__cover-text">Tap to reveal</p>
          <p className="card-face__cover-sub">Pass the phone to the actor</p>
        </div>
      )}
    </button>
  );
}
