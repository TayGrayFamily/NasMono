import { useEffect, useState } from 'react';
import type { CharadesCard, RevealExtraKey } from '../types.js';
import { useCardImage } from '../hooks/useCardImage.js';
import {
  REVEAL_EXTRA_LABELS,
  getAvailableRevealExtras,
  getCardContext,
} from '../lib/revealExtras.js';
import { isGiphyConfigured } from '../lib/giphy.js';
import './CardRevealExtras.css';

interface CardRevealExtrasProps {
  card: CharadesCard;
  revealed: boolean;
}

export function CardRevealExtras({ card, revealed }: CardRevealExtrasProps) {
  const extras = getAvailableRevealExtras(card);
  const [open, setOpen] = useState<Set<RevealExtraKey>>(() => new Set());
  const imageState = useCardImage(card, revealed && extras.includes('image'));

  useEffect(() => {
    setOpen(new Set());
  }, [card.id]);

  if (!revealed || extras.length === 0) {
    return null;
  }

  const toggle = (key: RevealExtraKey) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const context = getCardContext(card);

  return (
    <div className="card-reveal-extras">
      <div className="card-reveal-extras__chips" role="toolbar" aria-label="Extra clues">
        {extras.map((key) => (
          <button
            key={key}
            type="button"
            className={`card-reveal-extras__chip ${open.has(key) ? 'card-reveal-extras__chip--open' : ''}`}
            aria-pressed={open.has(key)}
            onClick={() => toggle(key)}
          >
            {REVEAL_EXTRA_LABELS[key]}
          </button>
        ))}
      </div>

      {open.has('image') && (
        <div className="card-reveal-extras__panel" role="region" aria-label="Image clue">
          {imageState.status === 'loading' && (
            <p className="card-reveal-extras__status">Loading image…</p>
          )}
          {imageState.status === 'ready' && (
            <img
              className="card-reveal-extras__image"
              src={imageState.url}
              alt={imageState.alt}
              loading="lazy"
              decoding="async"
            />
          )}
          {imageState.status === 'unavailable' && imageState.reason === 'missing-key' && (
            <p className="card-reveal-extras__status">
              Add <code>VITE_GIPHY_API_KEY</code> to load images from Giphy.
            </p>
          )}
          {imageState.status === 'unavailable' && imageState.reason === 'not-found' && (
            <p className="card-reveal-extras__status">No image found for this card.</p>
          )}
          {imageState.status === 'unavailable' && imageState.reason === 'error' && (
            <p className="card-reveal-extras__status">Could not load image. Try again later.</p>
          )}
          {imageState.status === 'idle' && card.emoji && (
            <p className="card-reveal-extras__emoji-fallback" aria-hidden="true">
              {card.emoji}
            </p>
          )}
        </div>
      )}

      {open.has('context') && context && (
        <div className="card-reveal-extras__panel" role="region" aria-label="Context">
          <p className="card-reveal-extras__text">{context}</p>
        </div>
      )}

      {open.has('guessHint') && card.guessHint && (
        <div className="card-reveal-extras__panel" role="region" aria-label="Hint">
          <p className="card-reveal-extras__text">{card.guessHint}</p>
        </div>
      )}

      {open.has('definition') && card.definition && (
        <div className="card-reveal-extras__panel" role="region" aria-label="Definition">
          <p className="card-reveal-extras__text">{card.definition}</p>
        </div>
      )}

      {!isGiphyConfigured() && card.imageSearch && !card.imageUrl && !card.giphyId && (
        <p className="card-reveal-extras__footnote">
          Images search Giphy when <code>VITE_GIPHY_API_KEY</code> is set.
        </p>
      )}
    </div>
  );
}
