import { useCallback } from 'react';
import type { AdminOverview } from '@/types/admin';
import { usePollingFetch } from './usePollingFetch';

const POLL_MS = 30_000;

async function fetchOverview(): Promise<AdminOverview> {
  const res = await fetch('/api/admin/overview');
  const text = await res.text();
  let body: { error?: string } = {};
  try {
    body = JSON.parse(text) as { error?: string };
  } catch {
    if (!res.ok) {
      throw new Error(text.trim() || res.statusText);
    }
    throw new Error('Invalid overview response');
  }
  if (!res.ok) {
    throw new Error(body.error ?? res.statusText);
  }
  return body as AdminOverview;
}

export function useAdminOverview(enabled = true) {
  const fetch = useCallback(() => fetchOverview(), []);
  const state = usePollingFetch({
    fetch,
    enabled,
    pollMs: POLL_MS,
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
