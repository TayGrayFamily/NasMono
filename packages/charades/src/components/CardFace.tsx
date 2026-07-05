import type { CharadesCard } from '../types.js';
import { CARD_TYPE_PLAY_HINT, formatCardType } from '../lib/cardTypes.js';
import { CardRevealExtras } from './CardRevealExtras.js';
import './CardFace.css';

interface CardFaceProps {
  card: CharadesCard | null;
  revealed: boolean;
  /** Player has not drawn a card for this turn yet — show pick-difficulty prompt. */
  awaitingDraw?: boolean;
  /** Tap the card back to reveal (only when drawn and hidden). */
  onReveal?: () => void;
}

export function CardFace({ card, revealed, awaitingDraw = false, onReveal }: CardFaceProps) {
  if (!card) {
    return (
      <div className="card-face card-face--empty">
        <p>No cards match your filters. End the round and adjust settings.</p>
      </div>
    );
  }

  const actInstruction = CARD_TYPE_PLAY_HINT[card.type];
  const canTapReveal = Boolean(onReveal) && !awaitingDraw;

  return (
    <div
      className={`card-flip ${revealed ? 'card-flip--revealed' : ''} card-flip--difficulty-${card.difficulty}`}
      aria-live={revealed ? 'polite' : 'off'}
    >
      <div className="card-flip__scene">
        <div className="card-flip__inner">
          {canTapReveal ? (
            <button
              type="button"
              className="card-flip__face card-flip__face--back card-face card-face--hidden"
              onClick={onReveal}
              aria-label="Reveal charades card"
            >
              <CardBack awaitingDraw={awaitingDraw} canTapReveal />
            </button>
          ) : (
            <div
              className="card-flip__face card-flip__face--back card-face card-face--hidden"
              aria-label="Charades card hidden"
            >
              <CardBack awaitingDraw={awaitingDraw} canTapReveal={false} />
            </div>
          )}

          <div
            className="card-flip__face card-flip__face--front card-face card-face--revealed"
            aria-label={revealed ? `Charades card: ${card.text}` : undefined}
            aria-hidden={!revealed}
          >
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
          </div>
        </div>
      </div>
    </div>
  );
}

function CardBack({
  awaitingDraw,
  canTapReveal,
}: {
  awaitingDraw: boolean;
  canTapReveal: boolean;
}) {
  return (
    <div className="card-face__cover card-face__cover--back">
      <div className="card-face__back-pattern" aria-hidden="true" />
      <span className="card-face__back-brand" aria-hidden="true">
        Charades
      </span>
      <p className="card-face__cover-text">
        {awaitingDraw ? 'Pick a difficulty first' : 'Card back'}
      </p>
      <p className="card-face__cover-sub">
        {awaitingDraw
          ? 'Open Difficulty below and pick one'
          : canTapReveal
            ? 'Tap to reveal'
            : 'Pass the phone to the actor'}
      </p>
    </div>
  );
}
