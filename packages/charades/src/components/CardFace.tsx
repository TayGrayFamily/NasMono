import type { CharadesCard } from '../types.js';
import { CARD_TYPE_PLAY_HINT, formatCardType } from '../lib/cardTypes.js';
import { CardRevealExtras } from './CardRevealExtras.js';
import './CardFace.css';

interface CardFaceProps {
  card: CharadesCard | null;
  revealed: boolean;
  /** Player has not drawn a card for this turn yet — show pick-difficulty prompt. */
  awaitingDraw?: boolean;
}

export function CardFace({ card, revealed, awaitingDraw = false }: CardFaceProps) {
  if (!card) {
    return (
      <div className="card-face card-face--empty">
        <p>No cards match your filters. End the round and adjust settings.</p>
      </div>
    );
  }

  const actInstruction = CARD_TYPE_PLAY_HINT[card.type];

  return (
    <div
      className={`card-face ${revealed ? 'card-face--revealed' : 'card-face--hidden'} card-face--difficulty-${card.difficulty}`}
      aria-live={revealed ? 'polite' : 'off'}
      aria-label={revealed ? `Charades card: ${card.text}` : 'Charades card hidden'}
    >
      {revealed ? (
        <div className="card-face__content">
          {card.emoji && (
            <span className="card-face__emoji" aria-hidden="true">
              {card.emoji}
            </span>
          )}
          <span className="card-face__type">{formatCardType(card.type)}</span>
          <p className="card-face__text">{card.text}</p>
          {actInstruction && <span className="card-face__hint">{actInstruction}</span>}
          <CardRevealExtras key={card.id} card={card} revealed={revealed} />
        </div>
      ) : (
        <div className="card-face__cover">
          <span className="card-face__cover-icon" aria-hidden="true">
            {awaitingDraw ? '1' : '?'}
          </span>
          <p className="card-face__cover-text">
            {awaitingDraw ? 'Pick a difficulty first' : 'Card hidden'}
          </p>
          <p className="card-face__cover-sub">
            {awaitingDraw ? 'Open Difficulty below and pick one' : 'Pass the phone to the actor'}
          </p>
        </div>
      )}
    </div>
  );
}
