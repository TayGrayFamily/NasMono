import { describe, expect, it } from 'vitest';
import { isMobileViewport } from './viewport.js';

describe('viewport', () => {
  it('treats iPhone 13 Pro Max portrait as mobile', () => {
    expect(isMobileViewport(428, 926)).toBe(true);
  });

  it('treats iPhone 13 Pro Max landscape as mobile', () => {
    expect(isMobileViewport(926, 428)).toBe(true);
  });

  it('treats desktop widths as non-mobile', () => {
    expect(isMobileViewport(1280, 800)).toBe(false);
  });
});
