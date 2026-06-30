import { maxSeverity, severityFromPercent, type Severity } from '@/constants/statusThresholds';
import type { AdminOverview } from '@/types/admin';
import type { TempPanelSummary } from '@/types/temperature';
import type { MetricsAnalytics } from '@/types/metrics';
import { alertsSeverity } from './alertUtils';
import { attentionSeverity, containersNeedingAttention } from './containerInsights';
import {
  collectCurrentTemps,
  containersSeverity,
  pctThresholds,
  storageSeverity,
  temperatureSeverityFromReadings,
  totalStoragePercent,
} from './healthChecks';

export type PanelGroupId = 'docker' | 'system' | 'alerts';

export type PanelCard = {
  id: string;
  title: string;
  severity: Severity;
  summary: string;
  detail?: string;
  to: string;
};

export type PanelGroup = {
  id: PanelGroupId;
  title: string;
  severity: Severity;
  cards: PanelCard[];
};

export type ControlPanelReport = {
  hostname: string;
  groups: PanelGroup[];
};

function buildDockerGroup(data: AdminOverview): PanelGroup {
  const attentionItems = containersNeedingAttention(data.containers.items);
  const severity =
    attentionItems.length > 0
      ? attentionItems.reduce(
          (worst, c) => maxSeverity(worst, attentionSeverity(c.attention)),
          'ok' as Severity,
        )
      : containersSeverity(data);

  return {
    id: 'docker',
    title: 'Docker',
    severity,
    cards: [],
  };
}

function buildSystemGroup(
  data: AdminOverview,
  tempSummary?: TempPanelSummary,
  metrics?: MetricsAnalytics,
): PanelGroup {
  const limits = pctThresholds(data);
  const cpuPct = Math.round(data.metrics.cpuPercent);
  const memPct = Math.round(data.metrics.memoryPercent);
  const cpuSev = severityFromPercent(cpuPct, limits);
  const memSev = severityFromPercent(memPct, limits);

  const temps = collectCurrentTemps(data);
  const maxTemp = temps.length > 0 ? Math.max(...temps) : null;
  const minTemp = temps.length > 0 ? Math.min(...temps) : null;
  let tempSev = temperatureSeverityFromReadings(temps);
  if (tempSummary?.anomalies.some((a) => a.severity === 'critical')) {
    tempSev = 'critical';
  } else if (tempSummary?.anomalies.length) {
    tempSev = maxSeverity(tempSev, 'warn');
  }

  const storagePct = totalStoragePercent(data);
  const storageSev = storageSeverity(data);
  const shareCount = data.shares.length;

  let tempDetail = 'All disks reporting';
  if (minTemp != null && maxTemp != null && minTemp !== maxTemp) {
    tempDetail = `${minTemp}–${maxTemp}°C across ${temps.length} sensors`;
  } else if (tempSummary?.summary.hottest) {
    tempDetail = `Hottest: ${tempSummary.summary.hottest.name}`;
  }
  if (tempSummary && tempSummary.anomalies.length > 0) {
    tempDetail = `${tempSummary.anomalies.length} anomaly${tempSummary.anomalies.length === 1 ? '' : 'ies'} in 24h`;
  }

  const arrayLabel =
    data.array.state === 'STARTED'
      ? `Array started · ${data.array.disks.length} disk${data.array.disks.length === 1 ? '' : 's'}`
      : data.array.state;

  const cards: PanelCard[] = [
    {
      id: 'cpu',
      title: 'CPU',
      severity: cpuSev,
      summary: `${cpuPct}%`,
      detail:
        metrics?.cpu.min != null && metrics?.cpu.max != null
          ? `${metrics.cpu.min}–${metrics.cpu.max}% (${metrics.window})`
          : data.system.cpuBrand,
      to: '/system/resources',
    },
    {
      id: 'memory',
      title: 'Memory',
      severity: memSev,
      summary: `${memPct}%`,
      detail: `${data.services.filter((s) => s.online).length}/${data.services.length} services online`,
      to: '/system/resources',
    },
    {
      id: 'temperature',
      title: 'Temperature',
      severity: tempSev,
      summary: maxTemp != null ? `${maxTemp}°C` : '—',
      detail: tempDetail,
      to: '/system/temperature',
    },
    {
      id: 'storage',
      title: 'Storage',
      severity: storageSev,
      summary: `${storagePct}% used`,
      detail: `${shareCount} share${shareCount === 1 ? '' : 's'} · ${arrayLabel}`,
      to: '/system/storage',
    },
  ];

  return {
    id: 'system',
    title: 'System',
    severity: maxSeverity(...cards.map((c) => c.severity)),
    cards,
  };
}

function buildAlertsGroup(data: AdminOverview): PanelGroup {
  return {
    id: 'alerts',
    title: 'Alerts',
    severity: alertsSeverity(data.notifications.items, data.warnings),
    cards: [],
  };
}

export function buildControlPanelReport(
  data: AdminOverview,
  tempSummary?: TempPanelSummary,
  metrics?: MetricsAnalytics,
): ControlPanelReport {
  return {
    hostname: data.system.hostname,
    groups: [
      buildDockerGroup(data),
      buildSystemGroup(data, tempSummary, metrics),
      buildAlertsGroup(data),
    ],
  };
}
