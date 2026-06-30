import type { AdminOverview } from '@/types/admin';
import { formatBytes } from './formatUtils';

export type MemoryAccounting = {
  total: number;
  inUse: number;
  available: number;
  active: number;
  buffcache: number;
};

/** Parts that add to total: inUse + available = total. */
export function getMemoryAccounting(metrics: AdminOverview['metrics']): MemoryAccounting {
  const total = metrics.memoryTotal;
  const available = metrics.memoryAvailable;
  return {
    total,
    available,
    inUse: Math.max(0, total - available),
    active: metrics.memoryActive,
    buffcache: metrics.memoryBuffcache,
  };
}

export function memorySummaryLine(metrics: AdminOverview['metrics']): string {
  const { total, inUse, available } = getMemoryAccounting(metrics);
  return `${formatBytes(total)} total · ${formatBytes(inUse)} in use · ${formatBytes(available)} available`;
}
