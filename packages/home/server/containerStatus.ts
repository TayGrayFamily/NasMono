const RECENT_RESTART_MINUTES = 120;

export type ContainerAttention =
  | 'none'
  | 'restarting'
  | 'unhealthy'
  | 'crashed'
  | 'stopped'
  | 'recent_restart'
  | 'created';

export type ParsedContainerStatus = {
  restarting: boolean;
  exitCode: number | null;
  upMinutes: number | null;
  recentlyRestarted: boolean;
  unhealthy: boolean;
};

function parseUpToMinutes(fragment: string): number | null {
  const match = fragment.trim().match(/^(\d+)\s+(second|minute|hour|day)s?$/i);
  if (!match) return null;
  const n = Number.parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  if (unit.startsWith('second')) return n / 60;
  if (unit.startsWith('minute')) return n;
  if (unit.startsWith('hour')) return n * 60;
  if (unit.startsWith('day')) return n * 24 * 60;
  return null;
}

export function parseContainerStatus(state: string, status: string): ParsedContainerStatus {
  const statusLower = status.toLowerCase();
  const unhealthy = state === 'RUNNING' && statusLower.includes('unhealthy');
  const restarting = statusLower.includes('restarting');

  let exitCode: number | null = null;
  const exitedMatch = status.match(/exited\s*\((\d+)\)/i);
  if (exitedMatch) {
    exitCode = Number.parseInt(exitedMatch[1]!, 10);
  }

  let upMinutes: number | null = null;
  const upMatch = status.match(/^up\s+([^(\n]+)/i);
  if (upMatch) {
    upMinutes = parseUpToMinutes(upMatch[1]!.trim());
  }

  const recentlyRestarted =
    state === 'RUNNING' && upMinutes != null && upMinutes < RECENT_RESTART_MINUTES;

  return { restarting, exitCode, upMinutes, recentlyRestarted, unhealthy };
}

export function containerAttention(
  state: string,
  status: string,
  parsed: ParsedContainerStatus,
): { attention: ContainerAttention; detail: string } {
  if (parsed.restarting) {
    return { attention: 'restarting', detail: status };
  }
  if (parsed.unhealthy) {
    return { attention: 'unhealthy', detail: status };
  }
  if (state !== 'RUNNING') {
    if (status.toLowerCase().includes('created')) {
      return { attention: 'created', detail: 'Not started' };
    }
    if (parsed.exitCode != null && parsed.exitCode !== 0) {
      return { attention: 'crashed', detail: `Exited (code ${parsed.exitCode})` };
    }
    return { attention: 'stopped', detail: status };
  }
  if (parsed.recentlyRestarted) {
    return { attention: 'recent_restart', detail: status };
  }
  return { attention: 'none', detail: status };
}

export function attentionSeverity(attention: ContainerAttention): 'ok' | 'warn' | 'critical' {
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
      return 'OK';
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
