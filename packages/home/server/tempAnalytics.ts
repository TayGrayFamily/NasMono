import type { TempHistoryFile, TempSample, TempWindowKey } from './tempHistory.js';
import { getHistory } from './tempHistory.js';

const WARN_C = 45;
const CRITICAL_C = 55;
const SWING_WARN_C = 12;
const SUSTAINED_WINDOW_MS = 6 * 60 * 60 * 1000;
const SUSTAINED_MIN_SAMPLES = 3;

export type TempAnomalyKind = 'sustainedHigh' | 'largeSwing' | 'critical';

export type TempAnomaly = {
  sensorId: string;
  name: string;
  kind: TempAnomalyKind;
  detail: string;
  severity: 'warn' | 'critical';
};

export type TempSensorRole = 'boot' | 'array' | 'drive' | 'cpu';

export type TempSensorStats = {
  id: string;
  name: string;
  device?: string;
  role: TempSensorRole;
  model?: string;
  slotKind?: 'parity' | 'data' | 'cache';
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  swing: number | null;
  samples: TempSample[];
  severity: 'ok' | 'warn' | 'critical';
};

export type TempAnalytics = {
  window: TempWindowKey;
  windowMs: number;
  sensors: TempSensorStats[];
  summary: {
    hottest: { name: string; current: number } | null;
    largestSwing: { name: string; swing: number } | null;
    anomalyCount: number;
  };
  anomalies: TempAnomaly[];
  collecting: boolean;
  sampleCount: number;
  historySpanMs: number;
  cpu: {
    available: boolean;
    current: number | null;
    message: string;
  };
};

function severityFromTemp(c: number | null): 'ok' | 'warn' | 'critical' {
  if (c == null) return 'ok';
  if (c >= CRITICAL_C) return 'critical';
  if (c >= WARN_C) return 'warn';
  return 'ok';
}

function statsForSensor(
  id: string,
  name: string,
  device: string | undefined,
  role: TempSensorRole,
  model: string | undefined,
  slotKind: 'parity' | 'data' | 'cache' | undefined,
  samples: TempSample[],
): TempSensorStats {
  const temps = samples.map((s) => s.c);
  const current = temps.length > 0 ? temps[temps.length - 1]! : null;
  const min = temps.length > 0 ? Math.min(...temps) : null;
  const max = temps.length > 0 ? Math.max(...temps) : null;
  const avg =
    temps.length > 0
      ? Math.round((temps.reduce((a, b) => a + b, 0) / temps.length) * 10) / 10
      : null;
  const swing = min != null && max != null ? max - min : null;

  return {
    id,
    name,
    device,
    role,
    model,
    slotKind,
    current,
    min,
    max,
    avg,
    swing,
    samples,
    severity: severityFromTemp(current),
  };
}

function historySpanMs(samples: TempSample[]): number {
  if (samples.length < 2) return 0;
  return samples[samples.length - 1]!.t - samples[0]!.t;
}

function detectAnomalies(sensor: TempSensorStats, windowMs: number): TempAnomaly[] {
  const anomalies: TempAnomaly[] = [];
  const now = Date.now();
  const recent = sensor.samples.filter((s) => s.t >= now - windowMs);

  if (sensor.current != null && sensor.current >= CRITICAL_C) {
    anomalies.push({
      sensorId: sensor.id,
      name: sensor.name,
      kind: 'critical',
      detail: `Currently ${sensor.current}°C`,
      severity: 'critical',
    });
  }

  const sustainedWindow = recent.filter((s) => s.t >= now - SUSTAINED_WINDOW_MS);
  const highInWindow = sustainedWindow.filter((s) => s.c >= WARN_C);
  if (highInWindow.length >= SUSTAINED_MIN_SAMPLES) {
    anomalies.push({
      sensorId: sensor.id,
      name: sensor.name,
      kind: 'sustainedHigh',
      detail: `${highInWindow.length} readings above ${WARN_C}°C in last 6h`,
      severity: 'warn',
    });
  }

  if (sensor.swing != null && sensor.swing >= SWING_WARN_C) {
    anomalies.push({
      sensorId: sensor.id,
      name: sensor.name,
      kind: 'largeSwing',
      detail: `${sensor.swing}°C swing (${sensor.min}–${sensor.max}°C)`,
      severity: 'warn',
    });
  }

  return anomalies;
}

export function buildTempAnalytics(
  window: TempWindowKey,
  windowMs: number,
  history?: TempHistoryFile,
): TempAnalytics {
  const data = history ?? getHistory(windowMs);
  const sensors = Object.entries(data.sensors).map(([id, sensor]) =>
    statsForSensor(
      id,
      sensor.name,
      sensor.device,
      sensor.role ?? 'drive',
      sensor.model,
      sensor.slotKind,
      sensor.samples,
    ),
  );

  sensors.sort((a, b) => {
    const roleOrder = (r: TempSensorRole) =>
      r === 'array' ? 0 : r === 'boot' ? 1 : r === 'drive' ? 2 : 3;
    const slotOrder = (k: TempSensorStats['slotKind']) =>
      k === 'parity' ? 0 : k === 'data' ? 1 : k === 'cache' ? 2 : 3;
    return (
      roleOrder(a.role) - roleOrder(b.role) ||
      slotOrder(a.slotKind) - slotOrder(b.slotKind) ||
      (b.current ?? 0) - (a.current ?? 0)
    );
  });

  const anomalies = sensors.flatMap((s) => detectAnomalies(s, windowMs));
  const hottest = sensors.find((s) => s.current != null) ?? null;
  const swingSorted = [...sensors]
    .filter((s) => s.swing != null)
    .sort((a, b) => (b.swing ?? 0) - (a.swing ?? 0));
  const largestSwing = swingSorted[0] ?? null;

  const sampleCount = sensors.reduce((n, s) => n + s.samples.length, 0);
  const spanMs = sensors.reduce((max, s) => Math.max(max, historySpanMs(s.samples)), 0);

  return {
    window,
    windowMs,
    sensors,
    summary: {
      hottest: hottest?.current != null ? { name: hottest.name, current: hottest.current } : null,
      largestSwing:
        largestSwing?.swing != null ? { name: largestSwing.name, swing: largestSwing.swing } : null,
      anomalyCount: anomalies.length,
    },
    anomalies,
    collecting: sampleCount < sensors.length * 2,
    sampleCount,
    historySpanMs: spanMs,
    cpu: {
      available: false,
      current: null,
      message: 'CPU package temperature is not exposed on Unraid API 4.x (disk temps only).',
    },
  };
}

export function getTempSummaryForPanel(
  windowMs = 24 * 60 * 60 * 1000,
): Pick<TempAnalytics, 'summary' | 'anomalies' | 'collecting'> {
  const analytics = buildTempAnalytics('24h', windowMs);
  return {
    summary: analytics.summary,
    anomalies: analytics.anomalies,
    collecting: analytics.collecting,
  };
}
