import { useEffect, useState } from 'react';
import type { CharadesCard } from '../types.js';
import { isGiphyConfigured, resolveGiphyStillById, searchGiphyStill } from '../lib/giphy.js';
import { cardHasImageSource } from '../lib/revealExtras.js';

export type CardImageState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; url: string; alt: string }
  | { status: 'unavailable'; reason: 'missing-key' | 'not-found' | 'error' };

async function resolveCardImage(card: CharadesCard): Promise<string | undefined> {
  if (card.imageUrl) return card.imageUrl;
  if (card.giphyId) return resolveGiphyStillById(card.giphyId);
  if (card.imageSearch) return searchGiphyStill(card.imageSearch);
  return undefined;
}

export function useCardImage(card: CharadesCard, enabled: boolean): CardImageState {
  const [state, setState] = useState<CardImageState>({ status: 'idle' });

  useEffect(() => {
    if (!enabled || !cardHasImageSource(card)) {
      setState({ status: 'idle' });
      return;
    }

    if (card.imageUrl) {
      setState({
        status: 'ready',
        url: card.imageUrl,
        alt: card.imageAlt ?? card.text,
      });
      return;
    }

    if (!card.giphyId && !card.imageSearch) {
      setState({ status: 'idle' });
      return;
    }

    if (!isGiphyConfigured()) {
      setState({ status: 'unavailable', reason: 'missing-key' });
      return;
    }

    let cancelled = false;
    setState({ status: 'loading' });

    resolveCardImage(card)
      .then((url) => {
        if (cancelled) return;
        if (!url) {
          setState({ status: 'unavailable', reason: 'not-found' });
          return;
        }
        setState({
          status: 'ready',
          url,
          alt: card.imageAlt ?? card.text,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable', reason: 'error' });
      });

    return () => {
      cancelled = true;
    };
  }, [card, enabled]);

  return state;
}
