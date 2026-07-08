import {
  containerAttention,
  parseContainerStatus,
  type ContainerAttention,
} from './containerStatus.js';
import {
  getComposeManagerStackUrl,
  getStackUpdateContainerMatch,
  isAdminActionsEnabled,
} from './adminActionsConfig.js';
import { getUnraidConfig, unraidQuery } from './unraidGraphql.js';
import { extractTempReadings, recordTempSample } from './tempHistory.js';
import { recordMetricsSample } from './metricsHistory.js';

const OVERVIEW_QUERY = `
query AdminOverview {
  info {
    os { hostname distro release uptime }
    cpu { brand cores threads }
    versions { core { unraid api } }
    baseboard { memMax memSlots }
    memory { layout { bank size type clockSpeed } }
    display { warning critical }
  }
  metrics {
    cpu { percentTotal }
    memory {
      total used free available active buffcache percentTotal
    }
  }
  array {
    state
    parityCheckStatus { status progress }
    boot { name device type status temp fsSize fsFree fsUsed }
    parities { name device type status temp }
    disks { name device type status temp fsFree fsSize }
    caches { name device type status temp }
  }
  disks { name device temperature smartStatus size isSpinning }
  docker {
    containers { id names image state status autoStart }
  }
  shares { name free used }
  services { name online version }
  notifications {
    overview { unread { total } archive { total } }
    list(filter: { type: UNREAD, offset: 0, limit: 50 }) {
      id
      title
      subject
      description
      importance
      timestamp
      formattedTimestamp
      link
    }
  }
}
`;

const CONTAINER_UPDATE_FLAGS_QUERY = `
query ContainerUpdateFlags {
  docker {
    containers { id isUpdateAvailable }
  }
}
`;

type GqlFsUsage = {
  name: string;
  device?: string | null;
  type?: string | null;
  fsSize: number | null;
  fsFree: number | null;
  fsUsed: number | null;
  status?: string;
  temp?: number | null;
};

type GqlPhysicalDisk = {
  name: string;
  device: string | null;
  temperature: number | null;
  smartStatus: string | null;
  size: number | null;
  isSpinning: boolean | null;
};

type GqlOverview = {
  info: {
    os: { hostname: string; distro: string; release: string; uptime: string };
    cpu: { brand: string; cores: number; threads: number };
    versions: { core: { unraid: string; api: string } };
    baseboard: { memMax: number; memSlots: number };
    memory: {
      layout: Array<{ bank: string; size: number; type: string; clockSpeed: number }>;
    };
    display: { warning: number; critical: number };
  };
  metrics: {
    cpu: { percentTotal: number };
    memory: {
      total: number;
      used: number;
      free: number;
      available: number;
      active: number;
      buffcache: number;
      percentTotal: number;
    };
  };
  array: {
    state: string;
    parityCheckStatus: { status: string; progress: number };
    boot: GqlFsUsage;
    parities: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
    }>;
    disks: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
      fsFree: number | null;
      fsSize: number | null;
    }>;
    caches: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
    }>;
  };
  disks: GqlPhysicalDisk[];
  docker: {
    containers: Array<{
      id: string;
      names: string[];
      image: string;
      state: string;
      status: string;
      autoStart: boolean;
    }> | null;
  } | null;
  shares: Array<{ name: string; free: number; used: number }>;
  services: Array<{ name: string; online: boolean; version: string | null }>;
  notifications: {
    overview: {
      unread: { total: number };
      archive: { total: number };
    };
    list: Array<{
      id: string;
      title: string;
      subject: string;
      description: string;
      importance: string;
      timestamp: string | null;
      formattedTimestamp: string | null;
      link: string | null;
    }>;
  };
};

export type AdminNotification = {
  id: string;
  title: string;
  subject: string;
  description: string;
  importance: 'ALERT' | 'WARNING' | 'INFO' | string;
  timestamp: string | null;
  formattedTimestamp: string | null;
  link: string | null;
};

export type { ContainerAttention };

export type AdminContainerSummary = {
  id: string;
  name: string;
  image: string;
  updateAvailable: boolean;
  state: string;
  status: string;
  autoStart: boolean;
  unhealthy: boolean;
  attention: ContainerAttention;
  attentionDetail: string;
  restarting: boolean;
  exitCode: number | null;
  recentlyRestarted: boolean;
};

export type FsUsageGauge = {
  label: string;
  percent: number;
  usedBytes: number | null;
  totalBytes: number | null;
};

export type MemoryLegend = {
  systemBytes: number;
  dockerBytes: number;
  freeBytes: number;
  memoryType: string;
  usableBytes: number;
  maxBytes: number;
};

export type AdminOverview = {
  system: {
    hostname: string;
    distro: string;
    release: string;
    uptime: string;
    cpuBrand: string;
    cpuCores: number;
    cpuThreads: number;
    unraidVersion: string;
    apiVersion: string;
  };
  thresholds: {
    warning: number;
    critical: number;
  };
  systemCard: {
    memoryPercent: number;
    memoryLegend: MemoryLegend;
    flash: FsUsageGauge;
    logFilesystem: FsUsageGauge | null;
    dockerVdisk: FsUsageGauge | null;
  };
  metrics: {
    cpuPercent: number;
    memoryTotal: number;
    memoryUsed: number;
    memoryAvailable: number;
    memoryActive: number;
    memoryBuffcache: number;
    memoryPercent: number;
  };
  array: {
    state: string;
    parityStatus: string;
    parityProgress: number;
    boot: {
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
      fsFree: number | null; // kilobytes
      fsSize: number | null; // kilobytes
      fsUsed: number | null; // kilobytes
    };
    parities: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
    }>;
    disks: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
      fsFree: number | null;
      fsSize: number | null;
    }>;
    caches: Array<{
      name: string;
      device: string | null;
      type: string;
      status: string;
      temp: number | null;
    }>;
  };
  physicalDisks: Array<{
    name: string;
    device: string | null;
    temperature: number | null;
    smartStatus: string | null;
    size: number | null;
    isSpinning: boolean | null;
  }>;
  containers: {
    total: number;
    running: number;
    stopped: number;
    unhealthy: number;
    restarting: number;
    crashed: number;
    updatesAvailable: number;
    items: AdminContainerSummary[];
  };
  capabilities: {
    adminActions: boolean;
    stackUpdateContainerMatch: string | null;
    composeManagerStackUrl: string | null;
  };
  shares: Array<{ name: string; free: number; used: number }>;
  services: Array<{ name: string; online: boolean; version: string | null }>;
  notifications: {
    unread: number;
    archived: number;
    items: AdminNotification[];
  };
  warnings: string[];
};

function stripLeadingSlash(name: string): string {
  return name.startsWith('/') ? name.slice(1) : name;
}

function fsPercent(used: number | null, size: number | null): number {
  if (used == null || size == null || size <= 0) return 0;
  return Math.round((used / size) * 100);
}

function fsGauge(label: string, entry: GqlFsUsage): FsUsageGauge {
  const usedKb =
    entry.fsUsed ??
    (entry.fsSize != null && entry.fsFree != null ? entry.fsSize - entry.fsFree : null);
  const totalKb = entry.fsSize;
  return {
    label,
    percent: fsPercent(usedKb, totalKb),
    usedBytes: usedKb != null ? usedKb * 1024 : null,
    totalBytes: totalKb != null ? totalKb * 1024 : null,
  };
}

function sumMemoryLayout(layout: GqlOverview['info']['memory']['layout']): {
  usableBytes: number;
  memoryType: string;
} {
  let usableBytes = 0;
  let memoryType = 'RAM';
  for (const stick of layout) {
    if (stick.size > 0) {
      usableBytes += stick.size;
      if (stick.type && stick.type !== 'Empty') memoryType = stick.type;
    }
  }
  return { usableBytes, memoryType };
}

function buildMemoryLegend(
  memory: GqlOverview['metrics']['memory'],
  layout: GqlOverview['info']['memory']['layout'],
  baseboard: GqlOverview['info']['baseboard'],
): MemoryLegend {
  const { usableBytes, memoryType } = sumMemoryLayout(layout);
  const freeBytes = memory.available;
  const inUseBytes = Math.max(0, memory.total - memory.available);
  const systemBytes = memory.active;
  const dockerBytes = Math.max(0, inUseBytes - systemBytes);

  return {
    systemBytes,
    dockerBytes,
    freeBytes,
    memoryType,
    usableBytes: usableBytes > 0 ? usableBytes : memory.total,
    maxBytes: baseboard.memMax > 0 ? baseboard.memMax : memory.total,
  };
}

function normalizeDeviceId(device: string | null | undefined): string {
  if (!device) return '';
  return device.replace(/^\/dev\//, '').trim();
}

function mapPhysicalDisks(
  disks: GqlPhysicalDisk[],
  bootDevice: string | null | undefined,
): AdminOverview['physicalDisks'] {
  const bootId = normalizeDeviceId(bootDevice);
  return disks
    .filter((d) => normalizeDeviceId(d.device) !== bootId)
    .map((d) => ({
      name: d.name,
      device: d.device,
      temperature: d.temperature,
      smartStatus: d.smartStatus,
      size: d.size,
      isSpinning: d.isSpinning,
    }));
}

function mapBootDisk(boot: GqlFsUsage): AdminOverview['array']['boot'] {
  return {
    name: boot.name,
    device: boot.device ?? null,
    type: boot.type ?? 'FLASH',
    status: boot.status ?? 'UNKNOWN',
    temp: boot.temp ?? null,
    fsFree: boot.fsFree,
    fsSize: boot.fsSize,
    fsUsed: boot.fsUsed,
  };
}

function buildSystemCard(data: GqlOverview): AdminOverview['systemCard'] {
  const memoryLegend = buildMemoryLegend(
    data.metrics.memory,
    data.info.memory.layout,
    data.info.baseboard,
  );
  const boot = data.array.boot;
  const flashLabel = boot.name ? `Boot (${boot.name})` : 'Boot drive';

  return {
    memoryPercent: Math.round(data.metrics.memory.percentTotal),
    memoryLegend,
    flash: fsGauge(flashLabel, boot),
    logFilesystem: null,
    dockerVdisk: null,
  };
}

function mapContainers(
  raw: NonNullable<GqlOverview['docker']>['containers'],
  updateFlags: Map<string, boolean>,
): AdminOverview['containers'] {
  const rows = raw ?? [];
  const items: AdminContainerSummary[] = rows.map((c) => {
    const name = stripLeadingSlash(c.names?.[0] ?? 'unknown');
    const parsed = parseContainerStatus(c.state, c.status);
    const { attention, detail } = containerAttention(c.state, c.status, parsed);
    const id = c.id?.trim() || name;
    return {
      id,
      name,
      image: c.image ?? '',
      updateAvailable: updateFlags.get(id) === true,
      state: c.state,
      status: c.status,
      autoStart: c.autoStart,
      unhealthy: parsed.unhealthy,
      attention,
      attentionDetail: detail,
      restarting: parsed.restarting,
      exitCode: parsed.exitCode,
      recentlyRestarted: parsed.recentlyRestarted,
    };
  });

  const running = items.filter((c) => c.state === 'RUNNING' && !c.restarting).length;
  const unhealthy = items.filter((c) => c.unhealthy).length;
  const restarting = items.filter((c) => c.restarting).length;
  const crashed = items.filter((c) => c.attention === 'crashed').length;
  const updatesAvailable = items.filter((c) => c.updateAvailable).length;

  return {
    total: items.length,
    running,
    stopped: items.length - running - restarting,
    unhealthy,
    restarting,
    crashed,
    updatesAvailable,
    items,
  };
}

/** Optional — older Unraid API builds may not expose isUpdateAvailable. */
async function fetchContainerUpdateFlags(): Promise<{
  flags: Map<string, boolean>;
  warnings: string[];
}> {
  try {
    const { data, warnings } = await unraidQuery<{
      docker: {
        containers: Array<{ id: string; isUpdateAvailable: boolean | null }> | null;
      } | null;
    }>(CONTAINER_UPDATE_FLAGS_QUERY);
    const flags = new Map<string, boolean>();
    for (const c of data.docker?.containers ?? []) {
      const id = c.id?.trim();
      if (id && c.isUpdateAvailable === true) {
        flags.set(id, true);
      }
    }
    return { flags, warnings };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { flags: new Map(), warnings: [`update flags unavailable: ${message}`] };
  }
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  if (!getUnraidConfig()) {
    throw new Error('Unraid GraphQL not configured (UNRAID_GRAPHQL_URL / UNRAID_API_KEY)');
  }

  const { data, warnings } = await unraidQuery<GqlOverview>(OVERVIEW_QUERY);
  const { flags: updateFlags, warnings: updateWarnings } = await fetchContainerUpdateFlags();

  const overview: AdminOverview = {
    system: {
      hostname: data.info.os.hostname,
      distro: data.info.os.distro,
      release: data.info.os.release,
      uptime: data.info.os.uptime,
      cpuBrand: data.info.cpu.brand,
      cpuCores: data.info.cpu.cores,
      cpuThreads: data.info.cpu.threads,
      unraidVersion: data.info.versions.core.unraid,
      apiVersion: data.info.versions.core.api,
    },
    thresholds: {
      warning: data.info.display.warning,
      critical: data.info.display.critical,
    },
    systemCard: buildSystemCard(data),
    metrics: {
      cpuPercent: data.metrics.cpu.percentTotal,
      memoryTotal: data.metrics.memory.total,
      memoryUsed: data.metrics.memory.used,
      memoryAvailable: data.metrics.memory.available,
      memoryActive: data.metrics.memory.active,
      memoryBuffcache: data.metrics.memory.buffcache,
      memoryPercent: data.metrics.memory.percentTotal,
    },
    array: {
      state: data.array.state,
      parityStatus: data.array.parityCheckStatus.status,
      parityProgress: data.array.parityCheckStatus.progress,
      boot: mapBootDisk(data.array.boot),
      parities: data.array.parities ?? [],
      disks: data.array.disks ?? [],
      caches: data.array.caches ?? [],
    },
    physicalDisks: mapPhysicalDisks(data.disks, data.array.boot.device),
    containers: mapContainers(data.docker?.containers ?? null, updateFlags),
    capabilities: {
      adminActions: isAdminActionsEnabled(),
      stackUpdateContainerMatch: getStackUpdateContainerMatch()?.source ?? null,
      composeManagerStackUrl: getComposeManagerStackUrl(),
    },
    shares: data.shares,
    services: data.services,
    notifications: {
      unread: data.notifications.overview.unread.total,
      archived: data.notifications.overview.archive.total,
      items: data.notifications.list.map((n) => ({
        id: n.id,
        title: n.title,
        subject: n.subject,
        description: n.description,
        importance: n.importance,
        timestamp: n.timestamp,
        formattedTimestamp: n.formattedTimestamp,
        link: n.link,
      })),
    },
    warnings: [...warnings, ...updateWarnings],
  };

  recordTempSample(extractTempReadings(overview));
  recordMetricsSample(overview.metrics.cpuPercent, overview.metrics.memoryPercent);
  return overview;
}
