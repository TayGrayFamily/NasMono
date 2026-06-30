import {
  maxSeverity,
  severityFromPercent,
  sharePercentFull,
  THRESHOLDS,
  type Severity,
} from '@/constants/statusThresholds';
import type { AdminOverview } from '@/types/admin';
import { attentionLabel, attentionSeverity } from './containerInsights';

export type HealthItem = {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
};

export type HealthReport = {
  overall: Severity;
  attention: HealthItem[];
  healthy: HealthItem[];
  summary: {
    critical: number;
    warn: number;
    ok: number;
  };
};

function pctThresholds(data: AdminOverview) {
  return { warn: data.thresholds.warning, critical: data.thresholds.critical };
}

function arrayDiskSeverity(disk: AdminOverview['array']['disks'][0]): Severity {
  if (disk.status !== 'DISK_OK') return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.critical) return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.warn) return 'warn';
  return 'ok';
}

function bootDiskSeverity(disk: AdminOverview['array']['boot']): Severity {
  if (disk.status !== 'DISK_OK') return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.critical) return 'critical';
  if (disk.temp != null && disk.temp >= THRESHOLDS.diskTemp.warn) return 'warn';
  const usedPct =
    disk.fsSize != null && disk.fsSize > 0 && disk.fsUsed != null
      ? (disk.fsUsed / disk.fsSize) * 100
      : 0;
  return severityFromPercent(usedPct, { warn: 70, critical: 90 });
}

function physicalDiskSeverity(disk: AdminOverview['physicalDisks'][0]): Severity {
  const smart = disk.smartStatus?.toUpperCase() ?? '';
  if (smart === 'FAILED' || smart === 'FAIL' || smart === 'CANCEL') return 'critical';
  if (smart && smart !== 'OK' && smart !== 'UNKNOWN') return 'warn';
  if (disk.temperature != null && disk.temperature >= THRESHOLDS.diskTemp.critical)
    return 'critical';
  if (disk.temperature != null && disk.temperature >= THRESHOLDS.diskTemp.warn) return 'warn';
  return 'ok';
}

function containerItemSeverity(c: AdminOverview['containers']['items'][0]): Severity {
  return attentionSeverity(c.attention);
}

const SEVERITY_RANK: Record<Severity, number> = { critical: 0, warn: 1, ok: 2 };

export function buildHealthReport(data: AdminOverview): HealthReport {
  const limits = pctThresholds(data);
  const attention: HealthItem[] = [];
  const healthy: HealthItem[] = [];

  const cpuPct = Math.round(data.metrics.cpuPercent);
  const memPct = Math.round(data.metrics.memoryPercent);
  const cpuSev = severityFromPercent(cpuPct, limits);
  const memSev = severityFromPercent(memPct, limits);

  const cpuItem: HealthItem = {
    id: 'cpu',
    severity: cpuSev,
    title: `CPU ${cpuPct}%`,
    detail: cpuSev === 'ok' ? 'Load normal' : 'High CPU usage',
  };
  (cpuSev === 'ok' ? healthy : attention).push(cpuItem);

  const memItem: HealthItem = {
    id: 'memory',
    severity: memSev,
    title: `Memory ${memPct}%`,
    detail: memSev === 'ok' ? 'Headroom available' : 'Memory pressure',
  };
  (memSev === 'ok' ? healthy : attention).push(memItem);

  if (data.array.state !== 'STARTED') {
    attention.push({
      id: 'array-state',
      severity: 'critical',
      title: `Array ${data.array.state}`,
      detail: 'Array is not in normal operating state',
    });
  } else if (data.array.parityStatus !== 'COMPLETED' && data.array.parityProgress > 0) {
    attention.push({
      id: 'array-parity',
      severity: 'warn',
      title: 'Parity check in progress',
      detail: `${data.array.parityStatus} · ${data.array.parityProgress}%`,
    });
  } else {
    healthy.push({
      id: 'array',
      severity: 'ok',
      title: 'Array started',
      detail: `Parity ${data.array.parityStatus.toLowerCase()}`,
    });
  }

  const boot = data.array.boot;
  const bootSev = bootDiskSeverity(boot);
  const bootPct =
    boot.fsSize != null && boot.fsSize > 0 && boot.fsUsed != null
      ? Math.round((boot.fsUsed / boot.fsSize) * 100)
      : 0;
  const bootItem: HealthItem = {
    id: 'boot',
    severity: bootSev,
    title: `Boot drive (${boot.name})`,
    detail:
      boot.status !== 'DISK_OK'
        ? boot.status
        : bootSev === 'ok'
          ? `${bootPct}% used · ${boot.status}`
          : `${bootPct}% used`,
  };
  (bootSev === 'ok' ? healthy : attention).push(bootItem);

  let arrayDiskIssues = 0;
  for (const disk of data.array.disks) {
    const sev = arrayDiskSeverity(disk);
    if (sev !== 'ok') {
      arrayDiskIssues += 1;
      attention.push({
        id: `array-disk-${disk.name}`,
        severity: sev,
        title: disk.name,
        detail: `${disk.status}${disk.temp != null ? ` · ${disk.temp}°C` : ''}`,
      });
    }
  }
  if (data.array.disks.length > 0 && arrayDiskIssues === 0) {
    healthy.push({
      id: 'array-disks',
      severity: 'ok',
      title: 'Array disks',
      detail: `${data.array.disks.length} disks OK`,
    });
  }

  let physicalDiskIssues = 0;
  for (const disk of data.physicalDisks) {
    const sev = physicalDiskSeverity(disk);
    if (sev !== 'ok') {
      physicalDiskIssues += 1;
      const smart = disk.smartStatus === 'UNKNOWN' ? 'SMART N/A' : (disk.smartStatus ?? '—');
      attention.push({
        id: `phys-${disk.device ?? disk.name}`,
        severity: sev,
        title: disk.name,
        detail: `${smart}${disk.temperature != null ? ` · ${disk.temperature}°C` : ''}`,
      });
    }
  }
  if (data.physicalDisks.length > 0 && physicalDiskIssues === 0) {
    healthy.push({
      id: 'physical-disks',
      severity: 'ok',
      title: 'Physical disks',
      detail: `${data.physicalDisks.length} disks OK`,
    });
  }

  let shareIssues = 0;
  for (const share of data.shares) {
    const pct = sharePercentFull(share.used, share.free);
    const sev = severityFromPercent(pct, limits);
    if (sev !== 'ok') {
      shareIssues += 1;
      attention.push({
        id: `share-${share.name}`,
        severity: sev,
        title: share.name,
        detail: `${pct}% full`,
      });
    }
  }
  if (data.shares.length > 0 && shareIssues === 0) {
    healthy.push({
      id: 'shares',
      severity: 'ok',
      title: 'Shares',
      detail: `${data.shares.length} shares within limits`,
    });
  }

  let containerIssues = 0;
  for (const c of data.containers.items) {
    const sev = containerItemSeverity(c);
    if (sev !== 'ok') {
      containerIssues += 1;
      attention.push({
        id: `container-${c.name}`,
        severity: sev,
        title: c.name,
        detail:
          c.attention === 'none'
            ? c.status
            : `${attentionLabel(c.attention)} · ${c.attentionDetail}`,
      });
    }
  }

  const running = data.containers.running;
  const total = data.containers.total;
  if (containerIssues === 0) {
    healthy.push({
      id: 'containers',
      severity: 'ok',
      title: 'Containers',
      detail: `${running}/${total} running`,
    });
  }

  if (data.notifications.unread > 0) {
    attention.push({
      id: 'notifications',
      severity: 'warn',
      title: 'Notifications',
      detail: `${data.notifications.unread} unread`,
    });
  }

  let offlineServices = 0;
  for (const svc of data.services) {
    if (!svc.online) {
      offlineServices += 1;
      attention.push({
        id: `service-${svc.name}`,
        severity: 'warn',
        title: svc.name,
        detail: 'Offline',
      });
    }
  }
  if (data.services.length > 0 && offlineServices === 0) {
    healthy.push({
      id: 'services',
      severity: 'ok',
      title: 'Services',
      detail: `${data.services.length} online`,
    });
  }

  for (const w of data.warnings) {
    attention.push({
      id: `warning-${w}`,
      severity: 'warn',
      title: 'API warning',
      detail: w,
    });
  }

  attention.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
  healthy.sort((a, b) => a.title.localeCompare(b.title));

  const critical = attention.filter((i) => i.severity === 'critical').length;
  const warn = attention.filter((i) => i.severity === 'warn').length;

  return {
    overall: attention.length === 0 ? 'ok' : maxSeverity(...attention.map((i) => i.severity)),
    attention,
    healthy,
    summary: { critical, warn, ok: healthy.length },
  };
}
