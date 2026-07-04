import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GiphyFetchError,
  clearGiphyCacheForTests,
  isGiphyConfigured,
  pickBestGiphyGif,
  resolveGiphyGifById,
  searchGiphyGif,
} from './giphy.js';

describe('giphy', () => {
  beforeEach(() => {
    clearGiphyCacheForTests();
    vi.stubEnv('VITE_GIPHY_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    clearGiphyCacheForTests();
  });

  it('reports when API key is missing', () => {
    vi.unstubAllEnvs();
    expect(isGiphyConfigured()).toBe(false);
  });

  it('resolves an animated gif by id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'abc123',
          images: {
            fixed_height: { url: 'https://media.giphy.com/animated.gif' },
            fixed_height_still: { url: 'https://media.giphy.com/still.jpg' },
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveGiphyGifById('abc123')).resolves.toBe(
      'https://media.giphy.com/animated.gif',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    await expect(resolveGiphyGifById('abc123')).resolves.toBe(
      'https://media.giphy.com/animated.gif',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('searches giphy and returns the best-matching animated gif', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'search-1',
              images: {
                downsized: { url: 'https://media.giphy.com/search-animated.gif' },
                downsized_still: { url: 'https://media.giphy.com/search-still.jpg' },
              },
            },
          ],
        }),
      }),
    );

    await expect(searchGiphyGif('lion king')).resolves.toBe(
      'https://media.giphy.com/search-animated.gif',
    );
  });

  it('prefers gifs whose titles match the query over unrelated first results', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'bad',
              title: 'taylor swift reputation tour',
              images: { fixed_height: { url: 'https://media.giphy.com/taylor.gif' } },
            },
            {
              id: 'good',
              title: 'madoka kaname magical girl anime',
              images: { fixed_height: { url: 'https://media.giphy.com/madoka.gif' } },
            },
          ],
        }),
      }),
    );

    await expect(searchGiphyGif('madoka kaname madoka magica anime')).resolves.toBe(
      'https://media.giphy.com/madoka.gif',
    );
  });

  it('pickBestGiphyGif rejects multiple unrelated results', () => {
    const picked = pickBestGiphyGif(
      [
        { id: 'a', title: 'random celebrity' },
        { id: 'b', title: 'another unrelated gif' },
      ],
      'madoka kaname anime',
    );
    expect(picked).toBeUndefined();
  });

  it('throws GiphyFetchError with HTTP status on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }),
    );

    await expect(searchGiphyGif('lion king')).rejects.toMatchObject({ status: 403 });
    await expect(searchGiphyGif('lion king')).rejects.toBeInstanceOf(GiphyFetchError);
  });
});
