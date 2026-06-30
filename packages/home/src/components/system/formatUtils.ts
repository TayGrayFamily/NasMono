export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** i;
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/** Unraid `shares` and array `fsSize` / `fsFree` / `fsUsed` fields are in kilobytes. */
export function formatKilobytes(kilobytes: number): string {
  if (kilobytes <= 0) return '0 B';
  return formatBytes(kilobytes * 1024);
}

export function kilobytesToBytes(kilobytes: number): number {
  return kilobytes * 1024;
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0 min';
  const mins = Math.round(ms / 60_000);
  if (mins < 60) return `${mins} min`;
  const hours = Math.round(ms / 3_600_000);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

export function formatUptime(iso: string): string {
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return iso;
  const ms = Date.now() - start.getTime();
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}
