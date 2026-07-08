import { useCallback } from 'react';
import type { LaunchPadResponse } from '@/types/launchpad';
import { usePollingFetch } from './usePollingFetch';

async function fetchLaunchpad(): Promise<LaunchPadResponse> {
  const res = await fetch('/api/launchpad');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  const body = (await res.json()) as LaunchPadResponse;
  return normalizeLaunchpadResponse(body);
}

export function normalizeLaunchpadResponse(body: LaunchPadResponse): LaunchPadResponse {
  return {
    apps: Array.isArray(body.apps) ? body.apps : [],
    otherServices: Array.isArray(body.otherServices) ? body.otherServices : [],
  };
}

export function useLaunchpad(enabled = true) {
  const fetch = useCallback(() => fetchLaunchpad(), []);
  const state = usePollingFetch({
    fetch,
    enabled,
    pollMs: 0,
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
