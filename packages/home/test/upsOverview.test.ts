import { describe, expect, it } from 'vitest';
import { resolveUpsPowerWatts } from '../server/upsOverview.js';

describe('resolveUpsPowerWatts', () => {
  it('prefers currentPower when reported', () => {
    expect(
      resolveUpsPowerWatts({
        currentPower: 347.6,
        nominalPower: 1000,
        loadPercentage: 35,
        inputVoltage: 120,
        outputVoltage: 120,
      }),
    ).toBe(348);
  });

  it('falls back to nominalPower × load when currentPower is missing', () => {
    expect(
      resolveUpsPowerWatts({
        currentPower: null,
        nominalPower: 800,
        loadPercentage: 50,
        inputVoltage: 120,
        outputVoltage: 120,
      }),
    ).toBe(400);
  });

  it('returns null when wattage cannot be derived', () => {
    expect(
      resolveUpsPowerWatts({
        currentPower: null,
        nominalPower: null,
        loadPercentage: 40,
        inputVoltage: 120,
        outputVoltage: 120,
      }),
    ).toBeNull();
  });
});
