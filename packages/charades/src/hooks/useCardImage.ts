import { useEffect, useMemo, useState } from 'react';
import type { CharadesCard } from '../types.js';
import {
  GiphyFetchError,
  isGiphyConfigured,
  resolveGiphyStillById,
  searchGiphyStill,
} from '../lib/giphy.js';
import { cardHasImageSource, getCardImageSearch } from '../lib/revealExtras.js';

export type CardImageState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; url: string; alt: string }
  | {
      status: 'unavailable';
      reason: 'missing-key' | 'invalid-key' | 'not-found' | 'error';
    };

async function resolveCardImage(card: CharadesCard): Promise<string | undefined> {
  if (card.imageUrl) return card.imageUrl;
  if (card.giphyId) return resolveGiphyStillById(card.giphyId);
  const query = getCardImageSearch(card);
  if (query) return searchGiphyStill(query);
  return undefined;
}

export function useCardImage(card: CharadesCard, enabled: boolean): CardImageState {
  const staticState = useMemo((): CardImageState | 'async' => {
    if (!enabled || !cardHasImageSource(card)) return { status: 'idle' };
    if (card.imageUrl) {
      return {
        status: 'ready',
        url: card.imageUrl,
        alt: card.imageAlt ?? card.text,
      };
    }
    if (!card.giphyId && !getCardImageSearch(card)) return { status: 'idle' };
    if (!isGiphyConfigured()) return { status: 'unavailable', reason: 'missing-key' };
    return 'async';
  }, [card, enabled]);

  const [fetchResult, setFetchResult] = useState<{
    cardId: string;
    state: CardImageState;
  } | null>(null);

  useEffect(() => {
    if (staticState !== 'async') return;

    let cancelled = false;
    const cardId = card.id;

    resolveCardImage(card)
      .then((url) => {
        if (cancelled) return;
        if (!url) {
          setFetchResult({ cardId, state: { status: 'unavailable', reason: 'not-found' } });
          return;
        }
        setFetchResult({
          cardId,
          state: {
            status: 'ready',
            url,
            alt: card.imageAlt ?? card.text,
          },
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const status = error instanceof GiphyFetchError ? error.status : undefined;
        const reason =
          status === 401 || status === 403 ? 'invalid-key' : ('error' as const);
        setFetchResult({ cardId, state: { status: 'unavailable', reason } });
      });

    return () => {
      cancelled = true;
    };
  }, [card, staticState]);

  if (staticState !== 'async') return staticState;
  if (fetchResult?.cardId === card.id) return fetchResult.state;
  return { status: 'loading' };
}
