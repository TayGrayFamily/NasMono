import { useCallback, useEffect, useState } from 'react';
import type { MetricsAnalytics, MetricsWindowKey } from '@/types/metrics';

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
  const [data, setData] = useState<MetricsAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const analytics = await fetchMetrics(windowKey);
      setData(analytics);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [enabled, windowKey]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const id = globalThis.setInterval(() => void load(), POLL_MS);
    return () => globalThis.clearInterval(id);
  }, [enabled, load]);

  return { data, error, loading, refresh: load };
}
