import type { CSSProperties, TransitionEvent } from 'react';
import type { CharadesCard } from '../types.js';
import { CARD_TYPE_PLAY_HINT, formatCardType } from '../lib/cardTypes.js';
import { getDifficultyCssVars } from '../lib/difficultyColors.js';
import { CardRevealExtras } from './CardRevealExtras.js';
import './CardFace.css';

interface CardFaceProps {
  card: CharadesCard | null;
  revealed: boolean;
  contentVisible: boolean;
  dealPhase?: 'in' | 'out';
  /** Player has not drawn a card for this turn yet — show pick-difficulty prompt. */
  awaitingDraw?: boolean;
  /** Tap the card back to reveal (only when drawn and hidden). */
  onReveal?: () => void;
  onTransitionEnd?: (event: TransitionEvent<HTMLDivElement>) => void;
}

export function CardFace({
  card,
  revealed,
  contentVisible,
  dealPhase,
  awaitingDraw = false,
  onReveal,
  onTransitionEnd,
}: CardFaceProps) {
  if (!card) {
    return (
      <div className="card-face card-face--empty">
        <p>No cards match your filters. End the round and adjust settings.</p>
      </div>
    );
  }

  const actInstruction = CARD_TYPE_PLAY_HINT[card.type];
  const canTapReveal = Boolean(onReveal) && !awaitingDraw;
  const difficultyStyle = getDifficultyCssVars(card.difficulty);

  return (
    <div
      className={`card-flip ${revealed ? 'card-flip--revealed' : ''}${dealPhase === 'in' ? ' card-flip--deal-in' : ''}${dealPhase === 'out' ? ' card-flip--deal-out' : ''} card-flip--difficulty-level`}
      style={difficultyStyle as CSSProperties}
      data-difficulty={card.difficulty}
      aria-live={revealed ? 'polite' : 'off'}
    >
      <div className="card-flip__scene">
        <div className="card-flip__inner" onTransitionEnd={onTransitionEnd}>
          {canTapReveal ? (
            <button
              type="button"
              className="card-flip__face card-flip__face--back card-face card-face--hidden"
              onClick={onReveal}
              aria-label="Flip charades card"
              aria-hidden={revealed}
              tabIndex={revealed ? -1 : 0}
            >
              <CardBack awaitingDraw={awaitingDraw} canTapReveal />
            </button>
          ) : (
            <div
              className="card-flip__face card-flip__face--back card-face card-face--hidden"
              aria-label="Charades card hidden"
              aria-hidden={revealed}
            >
              <CardBack awaitingDraw={awaitingDraw} canTapReveal={false} />
            </div>
          )}

          <div
            className="card-flip__face card-flip__face--front card-face card-face--trading"
            aria-label={revealed ? `Charades card: ${card.text}` : undefined}
            aria-hidden={!revealed}
          >
            <div
              className={`card-face__content ${contentVisible ? 'card-face__content--visible' : ''}`}
            >
              {card.emoji && (
                <span className="card-face__emoji" aria-hidden="true">
                  {card.emoji}
                </span>
              )}
              <span className="card-face__type">{formatCardType(card.type)}</span>
              <p className="card-face__text">{card.text}</p>
              {actInstruction && <span className="card-face__hint">{actInstruction}</span>}
              <CardRevealExtras key={card.id} card={card} revealed={revealed && contentVisible} />
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
      <div className="card-face__ripple" aria-hidden="true">
        <span className="card-face__ripple-wave card-face__ripple-wave--one" />
        <span className="card-face__ripple-wave card-face__ripple-wave--two" />
      </div>
      <div className="card-face__frame" aria-hidden="true" />
      <span className="card-face__back-mark" aria-hidden="true">
        ?
      </span>
      {(awaitingDraw || canTapReveal) && (
        <p className="card-face__cover-hint">
          {awaitingDraw ? 'Pick a difficulty in filters' : 'Tap to flip'}
        </p>
      )}
    </div>
  );
}
