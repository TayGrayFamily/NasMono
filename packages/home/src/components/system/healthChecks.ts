import {
  severityFromPercent,
  sharePercentFull,
  THRESHOLDS,
  type Severity,
} from '@/constants/statusThresholds';
import type { AdminContainerSummary, AdminOverview } from '@/types/admin';
import { attentionSeverity } from './containerInsights';

export function pctThresholds(data: AdminOverview) {
  return { warn: data.thresholds.warning, critical: data.thresholds.critical };
}

export function arrayDiskSeverity(disk: AdminOverview['array']['disks'][0]): Severity {
  if (disk.status !== 'DISK_OK') return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.critical) return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.warn) return 'warn';
  return 'ok';
}

export function bootDiskSeverity(disk: AdminOverview['array']['boot']): Severity {
  if (disk.status !== 'DISK_OK') return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.critical) return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.warn) return 'warn';
  const usedPct =
    disk.fsSize != null && disk.fsSize > 0 && disk.fsUsed != null
      ? (disk.fsUsed / disk.fsSize) * 100
      : 0;
  return severityFromPercent(usedPct, { warn: 70, critical: 90 });
}

export function physicalDiskSeverity(disk: AdminOverview['physicalDisks'][0]): Severity {
  const smart = disk.smartStatus?.toUpperCase() ?? '';
  if (smart === 'FAILED' || smart === 'FAIL' || smart === 'CANCEL') return 'critical';
  if (smart && smart !== 'OK' && smart !== 'UNKNOWN') return 'warn';
  if (disk.temperature != null && disk.temperature >= THRESHOLDS.diskTemp.critical)
    return 'critical';
  if (disk.temperature != null && disk.temperature >= THRESHOLDS.diskTemp.warn) return 'warn';
  return 'ok';
}

export function containerSeverity(c: AdminContainerSummary): Severity {
  return attentionSeverity(c.attention);
}

export function arraySeverity(data: AdminOverview): Severity {
  if (data.array.state !== 'STARTED') return 'critical';
  if (data.array.parityStatus !== 'COMPLETED' && data.array.parityProgress > 0) return 'warn';
  const bootSev = bootDiskSeverity(data.array.boot);
  let worst: Severity = bootSev;
  for (const disk of data.array.disks) {
    worst = maxSev(worst, arrayDiskSeverity(disk));
  }
  for (const disk of data.physicalDisks) {
    worst = maxSev(worst, physicalDiskSeverity(disk));
  }
  return worst;
}

export function sharesSeverity(data: AdminOverview): Severity {
  const limits = pctThresholds(data);
  let worst: Severity = 'ok';
  for (const share of data.shares) {
    const pct = sharePercentFull(share.used, share.free);
    worst = maxSev(worst, severityFromPercent(pct, limits));
  }
  return worst;
}

export function containersSeverity(data: AdminOverview): Severity {
  let worst: Severity = 'ok';
  for (const c of data.containers.items) {
    worst = maxSev(worst, containerSeverity(c));
  }
  return worst;
}

export function resourcesSeverity(data: AdminOverview): Severity {
  const limits = pctThresholds(data);
  const cpu = severityFromPercent(Math.round(data.metrics.cpuPercent), limits);
  const mem = severityFromPercent(Math.round(data.metrics.memoryPercent), limits);
  let worst = maxSev(cpu, mem);
  for (const svc of data.services) {
    if (!svc.online) worst = maxSev(worst, 'warn');
  }
  return worst;
}

export function temperatureSeverityFromReadings(temps: number[]): Severity {
  let worst: Severity = 'ok';
  for (const t of temps) {
    if (t >= THRESHOLDS.diskTemp.critical) worst = maxSev(worst, 'critical');
    else if (t >= THRESHOLDS.diskTemp.warn) worst = maxSev(worst, 'warn');
  }
  return worst;
}

export function collectCurrentTemps(data: AdminOverview): number[] {
  const temps: number[] = [];
  if (data.array.boot.temp != null) temps.push(data.array.boot.temp);
  for (const d of data.array.disks) {
    if (d.temp != null) temps.push(d.temp);
  }
  for (const d of data.physicalDisks) {
    if (d.temperature != null) temps.push(d.temperature);
  }
  return temps;
}

/** Aggregate used/total from array disk filesystems, falling back to share totals (KB). */
export function totalStoragePercent(data: AdminOverview): number {
  let used = 0;
  let total = 0;

  for (const disk of data.array.disks) {
    if (disk.fsSize != null && disk.fsFree != null && disk.fsSize > 0) {
      const diskUsed = disk.fsSize - disk.fsFree;
      used += diskUsed;
      total += disk.fsSize;
    }
  }

  if (total <= 0) {
    for (const share of data.shares) {
      used += share.used;
      total += share.used + share.free;
    }
  }

  if (total <= 0) return 0;
  return Math.round((used / total) * 100);
}

export function storageSeverity(data: AdminOverview): Severity {
  const pct = totalStoragePercent(data);
  const limits = pctThresholds(data);
  return severityFromPercent(pct, limits);
}

function maxSev(a: Severity, b: Severity): Severity {
  if (a === 'critical' || b === 'critical') return 'critical';
  if (a === 'warn' || b === 'warn') return 'warn';
  return 'ok';
}
