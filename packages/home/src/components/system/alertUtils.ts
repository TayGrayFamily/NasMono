import type { Severity } from '@/constants/statusThresholds';
import type { AdminNotification } from '@/types/admin';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';

export function notificationSeverity(importance: string): Severity {
  if (importance === 'ALERT') return 'critical';
  if (importance === 'WARNING') return 'warn';
  return 'ok';
}

export function alertsSeverity(items: AdminNotification[], apiWarnings: string[]): Severity {
  if (items.some((n) => n.importance === 'ALERT')) return 'critical';
  if (items.some((n) => n.importance === 'WARNING') || apiWarnings.length > 0) return 'warn';
  if (items.length > 0) return 'warn';
  return 'ok';
}

export function unraidNotificationUrl(link: string | null): string | null {
  if (!link) return null;
  const base = UNRAID_DASHBOARD_URL.replace(/\/$/, '');
  return link.startsWith('/') ? `${base}${link}` : `${base}/${link}`;
}
