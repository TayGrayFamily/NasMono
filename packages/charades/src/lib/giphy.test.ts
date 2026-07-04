import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  GiphyFetchError,
  clearGiphyCacheForTests,
  isGiphyConfigured,
  resolveGiphyStillById,
  searchGiphyStill,
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

  it('resolves a still image by gif id', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'abc123',
          images: {
            fixed_height_still: { url: 'https://media.giphy.com/still.jpg' },
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(resolveGiphyStillById('abc123')).resolves.toBe(
      'https://media.giphy.com/still.jpg',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
    await expect(resolveGiphyStillById('abc123')).resolves.toBe(
      'https://media.giphy.com/still.jpg',
    );
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('searches giphy and returns the first still', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: [
            {
              id: 'search-1',
              images: {
                downsized_still: { url: 'https://media.giphy.com/search-still.jpg' },
              },
            },
          ],
        }),
      }),
    );

    await expect(searchGiphyStill('lion king')).resolves.toBe(
      'https://media.giphy.com/search-still.jpg',
    );
  });

  it('throws GiphyFetchError with HTTP status on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      }),
    );

    await expect(searchGiphyStill('lion king')).rejects.toMatchObject({ status: 403 });
    await expect(searchGiphyStill('lion king')).rejects.toBeInstanceOf(GiphyFetchError);
  });
});
