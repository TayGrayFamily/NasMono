import type { Severity } from '@/constants/statusThresholds';
import type { AdminContainerSummary, ContainerAttention } from '@/types/admin';

export function attentionSeverity(attention: ContainerAttention): Severity {
  switch (attention) {
    case 'restarting':
    case 'unhealthy':
    case 'crashed':
      return 'critical';
    case 'stopped':
    case 'recent_restart':
    case 'created':
      return 'warn';
    default:
      return 'ok';
  }
}

export function attentionLabel(attention: ContainerAttention): string {
  switch (attention) {
    case 'restarting':
      return 'Restarting';
    case 'unhealthy':
      return 'Unhealthy';
    case 'crashed':
      return 'Crashed';
    case 'stopped':
      return 'Stopped';
    case 'recent_restart':
      return 'Recent restart';
    case 'created':
      return 'Not started';
    default:
      return 'Running';
  }
}

export function attentionRank(attention: ContainerAttention): number {
  switch (attention) {
    case 'restarting':
      return 0;
    case 'unhealthy':
      return 1;
    case 'crashed':
      return 2;
    case 'stopped':
      return 3;
    case 'recent_restart':
      return 4;
    case 'created':
      return 5;
    default:
      return 99;
  }
}

export function containerNeedsAttention(c: AdminContainerSummary): boolean {
  return c.attention !== 'none';
}

export function sortContainersByAttention(items: AdminContainerSummary[]): AdminContainerSummary[] {
  return [...items].sort(
    (a, b) =>
      attentionRank(a.attention) - attentionRank(b.attention) || a.name.localeCompare(b.name),
  );
}

export function containersNeedingAttention(
  items: AdminContainerSummary[],
): AdminContainerSummary[] {
  return sortContainersByAttention(items).filter(containerNeedsAttention);
}
