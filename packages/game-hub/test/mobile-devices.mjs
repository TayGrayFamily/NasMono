/**
 * Mobile viewport presets for Playwright screenshots and tests.
 *
 * Primary reference: iPhone 13 Pro Max (owner device) — use for spot-checks,
 * not as the only device. Always verify portrait and landscape.
 */
export const REFERENCE_MOBILE_DEVICE = 'iPhone 13 Pro Max';

/** @type {Record<string, { width: number; height: number }>} */
export const MOBILE_VIEWPORTS = {
  'iphone-13-pro-max-portrait': { width: 428, height: 926 },
  'iphone-13-pro-max-landscape': { width: 926, height: 428 },
  'iphone-se-portrait': { width: 375, height: 667 },
};
