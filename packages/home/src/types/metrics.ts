export type MetricSample = { t: number; v: number };

export type MetricSeriesStats = {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  swing: number | null;
  samples: MetricSample[];
};

export type MetricsWindowKey = '6h' | '24h' | '48h';

export type MetricsAnalytics = {
  window: MetricsWindowKey;
  windowMs: number;
  cpu: MetricSeriesStats;
  memory: MetricSeriesStats;
  collecting: boolean;
  sampleCount: number;
  historySpanMs: number;
};

export const METRICS_WINDOW_OPTIONS: { key: MetricsWindowKey; label: string }[] = [
  { key: '6h', label: '6 hours' },
  { key: '24h', label: '24 hours' },
  { key: '48h', label: '48 hours' },
];
