import type { CharadesCard } from '../types.js';
import { CARD_TYPE_PLAY_HINT, formatCardType } from '../lib/cardTypes.js';
import './CardFace.css';

interface CardFaceProps {
  card: CharadesCard | null;
  revealed: boolean;
}

export function CardFace({ card, revealed }: CardFaceProps) {
  if (!card) {
    return (
      <div className="card-face card-face--empty">
        <p>No cards match your filters. End the round and adjust settings.</p>
      </div>
    );
  }

  const playHint = card.actHint ?? CARD_TYPE_PLAY_HINT[card.type];

  return (
    <div
      className={`card-face ${revealed ? 'card-face--revealed' : 'card-face--hidden'}`}
      aria-live={revealed ? 'polite' : 'off'}
      aria-label={revealed ? `Charades card: ${card.text}` : 'Charades card hidden'}
    >
      {revealed ? (
        <div className="card-face__content">
          <span className="card-face__type">{formatCardType(card.type)}</span>
          <p className="card-face__text">{card.text}</p>
          {playHint && <span className="card-face__hint">{playHint}</span>}
        </div>
      ) : (
        <div className="card-face__cover">
          <span className="card-face__cover-icon" aria-hidden="true">
            ?
          </span>
          <p className="card-face__cover-text">Card hidden</p>
          <p className="card-face__cover-sub">Pass the phone to the actor</p>
        </div>
      )}
    </div>
  );
}
