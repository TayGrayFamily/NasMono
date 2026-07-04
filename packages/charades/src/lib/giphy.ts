import { getViteEnv } from './runtimeEnv.js';

const GIPHY_API = 'https://api.giphy.com/v1/gifs';

type GiphyImageSet = {
  url?: string;
  width?: string;
  height?: string;
};

type GiphyGif = {
  id: string;
  title?: string;
  images?: {
    fixed_height?: GiphyImageSet;
    downsized?: GiphyImageSet;
    original?: GiphyImageSet;
    fixed_height_still?: GiphyImageSet;
    downsized_still?: GiphyImageSet;
  };
};

type GiphyResponse = {
  data: GiphyGif | GiphyGif[];
};

export class GiphyFetchError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Giphy request failed (${status})`);
    this.name = 'GiphyFetchError';
    this.status = status;
  }
}

const imageCache = new Map<string, string>();

function getApiKey(): string | undefined {
  return getViteEnv('VITE_GIPHY_API_KEY');
}

/** Prefer animated renditions; fall back to stills if the API omits them. */
function pickGifUrl(gif: GiphyGif): string | undefined {
  return (
    gif.images?.fixed_height?.url ??
    gif.images?.downsized?.url ??
    gif.images?.original?.url ??
    gif.images?.fixed_height_still?.url ??
    gif.images?.downsized_still?.url
  );
}

async function fetchJson(url: string): Promise<GiphyResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new GiphyFetchError(response.status);
  }
  return (await response.json()) as GiphyResponse;
}

export function isGiphyConfigured(): boolean {
  return Boolean(getApiKey());
}

export async function resolveGiphyGifById(giphyId: string): Promise<string | undefined> {
  const cacheKey = `id:${giphyId}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = getApiKey();
  if (!apiKey) return undefined;

  const url = `${GIPHY_API}/${encodeURIComponent(giphyId)}?api_key=${encodeURIComponent(apiKey)}`;
  const payload = await fetchJson(url);
  const gif = Array.isArray(payload.data) ? payload.data[0] : payload.data;
  const gifUrl = gif ? pickGifUrl(gif) : undefined;
  if (gifUrl) imageCache.set(cacheKey, gifUrl);
  return gifUrl;
}

export async function searchGiphyGif(query: string): Promise<string | undefined> {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return undefined;

  const cacheKey = `search:${normalized}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = getApiKey();
  if (!apiKey) return undefined;

  const params = new URLSearchParams({
    api_key: apiKey,
    q: query.trim(),
    limit: '1',
    rating: 'g',
    lang: 'en',
  });
  const url = `${GIPHY_API}/search?${params.toString()}`;
  const payload = await fetchJson(url);
  const gif = Array.isArray(payload.data) ? payload.data[0] : undefined;
  const gifUrl = gif ? pickGifUrl(gif) : undefined;
  if (gifUrl) imageCache.set(cacheKey, gifUrl);
  return gifUrl;
}

export function clearGiphyCacheForTests() {
  imageCache.clear();
}
