import { fetchAdminOverview } from './adminOverview.js';
import { extractTempReadings, recordTempSample } from './tempHistory.js';

const SAMPLE_INTERVAL_MS = 5 * 60 * 1000;

let samplerStarted = false;
let samplerRunning = false;

async function sampleTemperatures(): Promise<void> {
  try {
    const overview = await fetchAdminOverview();
    recordTempSample(extractTempReadings(overview));
  } catch (err) {
    console.warn('[tempSampler] sample failed:', err instanceof Error ? err.message : err);
  }
}

export function startTempSampler(): void {
  if (samplerStarted) return;
  samplerStarted = true;

  const tick = async () => {
    if (samplerRunning) return;
    samplerRunning = true;
    try {
      await sampleTemperatures();
    } finally {
      samplerRunning = false;
    }
  };

  void tick();
  setInterval(() => void tick(), SAMPLE_INTERVAL_MS);
}
