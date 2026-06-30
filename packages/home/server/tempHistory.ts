import fs from 'fs';
import path from 'path';
import type { AdminOverview } from './adminOverview.js';
import { arraySlotKind, collectArraySlots, formatArraySlotLabel } from './arrayDiskLabels.js';

const FILE_VERSION = 1;
const SAMPLE_INTERVAL_MS = 5 * 60 * 1000;
const RETENTION_MS = 48 * 60 * 60 * 1000;

export type TempSample = { t: number; c: number };

export type TempSensorRole = 'boot' | 'array' | 'drive' | 'cpu';

export type TempSensorRecord = {
  name: string;
  device?: string;
  role?: TempSensorRole;
  model?: string;
  slotKind?: 'parity' | 'data' | 'cache';
  samples: TempSample[];
};

export type TempHistoryFile = {
  version: number;
  sensors: Record<string, TempSensorRecord>;
};

export type TempReading = {
  id: string;
  name: string;
  device?: string;
  celsius: number | null;
  role: TempSensorRole;
  model?: string;
  slotKind?: 'parity' | 'data' | 'cache';
};

export const TEMP_WINDOW_MS = {
  '6h': 6 * 60 * 60 * 1000,
  '24h': 24 * 60 * 60 * 1000,
  '48h': 48 * 60 * 60 * 1000,
} as const;

export type TempWindowKey = keyof typeof TEMP_WINDOW_MS;

export function parseTempWindow(raw: unknown): TempWindowKey {
  if (typeof raw === 'string' && raw in TEMP_WINDOW_MS) {
    return raw as TempWindowKey;
  }
  return '24h';
}

function getTempHistoryPath(): string {
  const explicit = process.env.TEMP_HISTORY_PATH?.trim();
  if (explicit) return explicit;
  const configPath = process.env.LAUNCHPAD_CONFIG_PATH?.trim();
  if (configPath) {
    return path.join(path.dirname(configPath), 'temp-history.json');
  }
  return path.join(process.cwd(), 'temp-history.json');
}

function emptyHistory(): TempHistoryFile {
  return { version: FILE_VERSION, sensors: {} };
}

function readHistory(): TempHistoryFile {
  const filePath = getTempHistoryPath();
  try {
    if (!fs.existsSync(filePath)) return emptyHistory();
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as TempHistoryFile;
    if (!parsed.sensors || typeof parsed.sensors !== 'object') return emptyHistory();
    return { version: FILE_VERSION, sensors: parsed.sensors };
  } catch {
    return emptyHistory();
  }
}

function writeHistory(data: TempHistoryFile): void {
  const filePath = getTempHistoryPath();
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

function pruneSamples(samples: TempSample[], now: number): TempSample[] {
  const cutoff = now - RETENTION_MS;
  return samples.filter((s) => s.t >= cutoff);
}

function normalizeDeviceId(device: string | null | undefined): string {
  if (!device) return '';
  return device
    .replace(/^\/dev\//, '')
    .trim()
    .toLowerCase();
}

function devicePath(deviceId: string): string {
  return deviceId.startsWith('/dev/') ? deviceId : `/dev/${deviceId}`;
}

export function extractTempReadings(data: AdminOverview): TempReading[] {
  const readings: TempReading[] = [];
  const seenDevices = new Set<string>();

  const modelByDevice = new Map<string, string>();
  for (const disk of data.physicalDisks) {
    const deviceId = normalizeDeviceId(disk.device);
    if (deviceId) modelByDevice.set(deviceId, disk.name);
  }

  const boot = data.array.boot;
  const bootDeviceId = normalizeDeviceId(boot.device);
  if (boot.temp != null) {
    const id = bootDeviceId || `boot-${boot.name}`;
    readings.push({
      id,
      name: formatArraySlotLabel(boot.name, boot.type ?? 'BOOT'),
      device: bootDeviceId ? devicePath(bootDeviceId) : undefined,
      celsius: boot.temp,
      role: 'boot',
      model: bootDeviceId ? modelByDevice.get(bootDeviceId) : undefined,
    });
    if (bootDeviceId) seenDevices.add(bootDeviceId);
  }

  for (const slot of collectArraySlots(data.array)) {
    if (slot.temp == null) continue;
    const deviceId = normalizeDeviceId(slot.device);
    const id = deviceId || `array-${slot.name}`;
    const model = deviceId ? modelByDevice.get(deviceId) : undefined;
    readings.push({
      id,
      name: formatArraySlotLabel(slot.name, slot.type),
      device: deviceId ? devicePath(deviceId) : undefined,
      celsius: slot.temp,
      role: 'array',
      model: model && model !== formatArraySlotLabel(slot.name, slot.type) ? model : undefined,
      slotKind: arraySlotKind(slot.name, slot.type),
    });
    if (deviceId) seenDevices.add(deviceId);
  }

  for (const disk of data.physicalDisks) {
    const deviceId = normalizeDeviceId(disk.device) || disk.name.toLowerCase();
    if (seenDevices.has(deviceId)) continue;
    if (disk.temperature == null) continue;

    readings.push({
      id: deviceId,
      name: disk.name,
      device: disk.device ?? (deviceId ? devicePath(deviceId) : undefined),
      celsius: disk.temperature,
      role: 'drive',
    });
    seenDevices.add(deviceId);
  }

  return readings;
}

export function recordTempSample(readings: TempReading[]): void {
  const now = Date.now();
  const history = readHistory();

  for (const reading of readings) {
    if (reading.celsius == null) continue;

    const existing = history.sensors[reading.id];
    const samples = existing?.samples ?? [];
    const last = samples[samples.length - 1];
    if (last && now - last.t < SAMPLE_INTERVAL_MS) {
      history.sensors[reading.id] = {
        name: reading.name,
        device: reading.device,
        role: reading.role,
        model: reading.model,
        slotKind: reading.slotKind,
        samples,
      };
      continue;
    }

    const nextSamples = pruneSamples([...samples, { t: now, c: reading.celsius }], now);

    history.sensors[reading.id] = {
      name: reading.name,
      device: reading.device,
      role: reading.role,
      model: reading.model,
      slotKind: reading.slotKind,
      samples: nextSamples,
    };
  }

  writeHistory(history);
}

export function getHistory(sinceMs?: number): TempHistoryFile {
  const history = readHistory();
  if (sinceMs == null) return history;

  const cutoff = Date.now() - sinceMs;
  const filtered: TempHistoryFile = { version: FILE_VERSION, sensors: {} };
  for (const [id, sensor] of Object.entries(history.sensors)) {
    filtered.sensors[id] = {
      ...sensor,
      samples: sensor.samples.filter((s) => s.t >= cutoff),
    };
  }
  return filtered;
}
