import { useCallback } from 'react';
import type { MetricsAnalytics, MetricsWindowKey } from '@/types/metrics';
import { usePollingFetch } from './usePollingFetch';

const POLL_MS = 30_000;

async function fetchMetrics(window: MetricsWindowKey): Promise<MetricsAnalytics> {
  const res = await fetch(`/api/admin/metrics?window=${window}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<MetricsAnalytics>;
}

export function useMetricsHistory(windowKey: MetricsWindowKey, enabled = true) {
  const fetch = useCallback(() => fetchMetrics(windowKey), [windowKey]);
  const state = usePollingFetch({
    fetch,
    enabled,
    pollMs: POLL_MS,
    resetKey: windowKey,
  });

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    refreshing: state.refreshing,
    isStale: state.isStale,
    refresh: state.refresh,
  };
}
