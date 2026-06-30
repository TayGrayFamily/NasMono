import fs from 'fs';
import path from 'path';

const FILE_VERSION = 1;
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000;
const RETENTION_MS = 48 * 60 * 60 * 1000;

export type MetricSample = { t: number; v: number };

export type MetricsHistoryFile = {
  version: number;
  cpu: MetricSample[];
  memory: MetricSample[];
};

function getMetricsHistoryPath(): string {
  const explicit = process.env.METRICS_HISTORY_PATH?.trim();
  if (explicit) return explicit;
  const configPath = process.env.LAUNCHPAD_CONFIG_PATH?.trim();
  if (configPath) {
    return path.join(path.dirname(configPath), 'metrics-history.json');
  }
  return path.join(process.cwd(), 'metrics-history.json');
}

function emptyHistory(): MetricsHistoryFile {
  return { version: FILE_VERSION, cpu: [], memory: [] };
}

function readHistory(): MetricsHistoryFile {
  const filePath = getMetricsHistoryPath();
  try {
    if (!fs.existsSync(filePath)) return emptyHistory();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as MetricsHistoryFile;
    return {
      version: FILE_VERSION,
      cpu: Array.isArray(parsed.cpu) ? parsed.cpu : [],
      memory: Array.isArray(parsed.memory) ? parsed.memory : [],
    };
  } catch {
    return emptyHistory();
  }
}

function writeHistory(data: MetricsHistoryFile): void {
  const filePath = getMetricsHistoryPath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

function pruneSamples(samples: MetricSample[], now: number): MetricSample[] {
  const cutoff = now - RETENTION_MS;
  return samples.filter((s) => s.t >= cutoff);
}

function appendSample(series: MetricSample[], value: number, now: number): MetricSample[] {
  const last = series[series.length - 1];
  if (last && now - last.t < SAMPLE_INTERVAL_MS) return series;
  return pruneSamples([...series, { t: now, v: Math.round(value * 10) / 10 }], now);
}

export function recordMetricsSample(cpuPercent: number, memoryPercent: number): void {
  const now = Date.now();
  const history = readHistory();
  history.cpu = appendSample(history.cpu, cpuPercent, now);
  history.memory = appendSample(history.memory, memoryPercent, now);
  writeHistory(history);
}

export function getMetricsHistory(sinceMs?: number): MetricsHistoryFile {
  const history = readHistory();
  if (sinceMs == null) return history;

  const cutoff = Date.now() - sinceMs;
  return {
    version: FILE_VERSION,
    cpu: history.cpu.filter((s) => s.t >= cutoff),
    memory: history.memory.filter((s) => s.t >= cutoff),
  };
}

export const METRICS_WINDOW_MS = {
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
} as const;

export type MetricsWindowKey = keyof typeof METRICS_WINDOW_MS;

export function parseMetricsWindow(raw: unknown): MetricsWindowKey {
  if (typeof raw === 'string' && raw in METRICS_WINDOW_MS) {
    return raw as MetricsWindowKey;
  }
  return '24h';
}
