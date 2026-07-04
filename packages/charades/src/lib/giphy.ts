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
    fixed_height_still?: GiphyImageSet;
    downsized_still?: GiphyImageSet;
    original_still?: GiphyImageSet;
  };
};

type GiphyResponse = {
  data: GiphyGif | GiphyGif[];
};

const imageCache = new Map<string, string>();

function getApiKey(): string | undefined {
  const key = import.meta.env.VITE_GIPHY_API_KEY;
  return typeof key === 'string' && key.trim().length > 0 ? key.trim() : undefined;
}

function pickStillUrl(gif: GiphyGif): string | undefined {
  return (
    gif.images?.fixed_height_still?.url ??
    gif.images?.downsized_still?.url ??
    gif.images?.original_still?.url
  );
}

async function fetchJson(url: string): Promise<GiphyResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Giphy request failed (${response.status})`);
  }
  return (await response.json()) as GiphyResponse;
}

export function isGiphyConfigured(): boolean {
  return Boolean(getApiKey());
}

export async function resolveGiphyStillById(giphyId: string): Promise<string | undefined> {
  const cacheKey = `id:${giphyId}`;
  const cached = imageCache.get(cacheKey);
  if (cached) return cached;

  const apiKey = getApiKey();
  if (!apiKey) return undefined;

  const url = `${GIPHY_API}/${encodeURIComponent(giphyId)}?api_key=${encodeURIComponent(apiKey)}`;
  const payload = await fetchJson(url);
  const gif = Array.isArray(payload.data) ? payload.data[0] : payload.data;
  const stillUrl = gif ? pickStillUrl(gif) : undefined;
  if (stillUrl) imageCache.set(cacheKey, stillUrl);
  return stillUrl;
}

export async function searchGiphyStill(query: string): Promise<string | undefined> {
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
  const stillUrl = gif ? pickStillUrl(gif) : undefined;
  if (stillUrl) imageCache.set(cacheKey, stillUrl);
  return stillUrl;
}

export function clearGiphyCacheForTests() {
  imageCache.clear();
}
