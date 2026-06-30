import { useCallback, useEffect, useState } from 'react';
import type { TempAnalytics, TempWindowKey } from '@/types/temperature';

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
  const [data, setData] = useState<TempAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const analytics = await fetchTemperature(windowKey);
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
