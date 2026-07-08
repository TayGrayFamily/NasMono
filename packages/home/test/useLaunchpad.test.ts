import { describe, expect, it } from 'vitest';
import { normalizeLaunchpadResponse } from '../src/hooks/useLaunchpad';

describe('normalizeLaunchpadResponse', () => {
  it('returns empty arrays when apps or otherServices are missing', () => {
    expect(normalizeLaunchpadResponse({} as never)).toEqual({
      apps: [],
      otherServices: [],
    });
  });

  it('preserves valid arrays', () => {
    const response = {
      apps: [{ id: 'jellyfin' }],
      otherServices: [{ id: 'c1', name: 'foo' }],
    };
    expect(normalizeLaunchpadResponse(response as never)).toEqual(response);
  });
});
