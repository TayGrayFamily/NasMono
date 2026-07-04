import { afterEach, describe, expect, it, vi } from 'vitest';
import { getViteEnv } from './runtimeEnv.js';

describe('runtimeEnv', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.stubGlobal('window', undefined);
  });

  it('prefers runtime override over build-time env', () => {
    vi.stubEnv('VITE_GIPHY_API_KEY', 'build-key');
    vi.stubGlobal('window', { __NASMONO_ENV__: { VITE_GIPHY_API_KEY: 'runtime-key' } });
    expect(getViteEnv('VITE_GIPHY_API_KEY')).toBe('runtime-key');
  });

  it('falls back to build-time env when runtime is empty', () => {
    vi.stubEnv('VITE_GIPHY_API_KEY', 'build-key');
    vi.stubGlobal('window', { __NASMONO_ENV__: { VITE_GIPHY_API_KEY: '' } });
    expect(getViteEnv('VITE_GIPHY_API_KEY')).toBe('build-key');
  });
});
