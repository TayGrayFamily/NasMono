import { useCallback } from 'react';
import type { TempAnalytics, TempWindowKey } from '@/types/temperature';
import { usePollingFetch } from './usePollingFetch';

const POLL_MS = 30_000;

async function fetchTemperature(windowKey: TempWindowKey): Promise<TempAnalytics> {
  const res = await fetch(`/api/admin/temperature?window=${windowKey}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<TempAnalytics>;
}

export function useTemperatureAnalytics(windowKey: TempWindowKey = '24h', enabled = true) {
  const fetch = useCallback(() => fetchTemperature(windowKey), [windowKey]);
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
