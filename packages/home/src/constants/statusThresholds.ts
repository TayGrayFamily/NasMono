export type Severity = 'ok' | 'warn' | 'critical';

export const THRESHOLDS = {
  cpu: { warn: 70, critical: 90 },
  memory: { warn: 80, critical: 95 },
  shareFull: { warn: 80, critical: 95 },
  diskTemp: { warn: 45, critical: 55 },
} as const;

export function severityFromPercent(
  percent: number,
  { warn, critical }: { warn: number; critical: number },
): Severity {
  if (percent >= critical) return 'critical';
  if (percent >= warn) return 'warn';
  return 'ok';
}

export function maxSeverity(...levels: Severity[]): Severity {
  if (levels.includes('critical')) return 'critical';
  if (levels.includes('warn')) return 'warn';
  return 'ok';
}

export function sharePercentFull(used: number, free: number): number {
  const total = used + free;
  if (total <= 0) return 0;
  return Math.round((used / total) * 100);
}
