export type TempAnomalyKind = 'sustainedHigh' | 'largeSwing' | 'critical';

export type TempAnomaly = {
  sensorId: string;
  name: string;
  kind: TempAnomalyKind;
  detail: string;
  severity: 'warn' | 'critical';
};

export type TempSample = { t: number; c: number };

export type TempSensorRole = 'boot' | 'array' | 'drive' | 'cpu';

export type TempWindowKey = '6h' | '24h' | '48h';

export const TEMP_WINDOW_OPTIONS: { key: TempWindowKey; label: string }[] = [
  { key: '6h', label: '6 hours' },
  { key: '24h', label: '24 hours' },
  { key: '48h', label: '48 hours' },
];

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

export type TempPanelSummary = Pick<TempAnalytics, 'summary' | 'anomalies' | 'collecting'>;

export const TEMP_ROLE_LABELS: Record<TempSensorRole, string> = {
  boot: 'Boot',
  array: 'Array',
  drive: 'Other drives',
  cpu: 'CPU',
};
