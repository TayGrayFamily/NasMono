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

export type ContainerAttention =
  | 'none'
  | 'restarting'
  | 'unhealthy'
  | 'crashed'
  | 'stopped'
  | 'recent_restart'
  | 'created';

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

export type AdminUpsDevice = {
  id: string;
  name: string;
  model: string;
  status: string;
  powerWatts: number | null;
  loadPercent: number;
  nominalPowerWatts: number | null;
  inputVoltage: number | null;
  outputVoltage: number | null;
  batteryPercent: number;
  batteryRuntimeSec: number;
  batteryHealth: string;
};

export type AdminPowerSummary = {
  available: boolean;
  totalWatts: number | null;
  devices: AdminUpsDevice[];
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
      fsFree: number | null; // kilobytes
      fsSize: number | null; // kilobytes
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
  shares: Array<{ name: string; free: number; used: number }>; // kilobytes (Unraid API)
  services: Array<{ name: string; online: boolean; version: string | null }>;
  notifications: {
    unread: number;
    archived: number;
    items: AdminNotification[];
  };
  power: AdminPowerSummary;
  warnings: string[];
};
