import type { MetricSample } from './metricsHistory.js';
import { getMetricsHistory, type MetricsWindowKey } from './metricsHistory.js';

export type MetricSeriesStats = {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  swing: number | null;
  samples: MetricSample[];
};

export type MetricsAnalytics = {
  window: MetricsWindowKey;
  windowMs: number;
  cpu: MetricSeriesStats;
  memory: MetricSeriesStats;
  power: MetricSeriesStats | null;
  collecting: boolean;
  sampleCount: number;
  historySpanMs: number;
};

function statsForSeries(samples: MetricSample[]): MetricSeriesStats {
  const values = samples.map((s) => s.v);
  const current = values.length > 0 ? values[values.length - 1]! : null;
  const min = values.length > 0 ? Math.min(...values) : null;
  const max = values.length > 0 ? Math.max(...values) : null;
  const avg =
    values.length > 0
      ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
      : null;
  const swing = min != null && max != null ? Math.round((max - min) * 10) / 10 : null;

  return { current, min, max, avg, swing, samples };
}

function historySpanMs(samples: MetricSample[]): number {
  if (samples.length < 2) return 0;
  return samples[samples.length - 1]!.t - samples[0]!.t;
}

export function buildMetricsAnalytics(
  window: MetricsWindowKey,
  windowMs: number,
): MetricsAnalytics {
  const history = getMetricsHistory(windowMs);
  const cpu = statsForSeries(history.cpu);
  const memory = statsForSeries(history.memory);
  const power = history.power.length > 0 ? statsForSeries(history.power) : null;
  const sampleCount = Math.max(history.cpu.length, history.memory.length, history.power.length);
  const spanMs = Math.max(
    historySpanMs(history.cpu),
    historySpanMs(history.memory),
    historySpanMs(history.power),
  );

  return {
    window,
    windowMs,
    cpu,
    memory,
    power,
    collecting: sampleCount < 2,
    sampleCount,
    historySpanMs: spanMs,
  };
}
