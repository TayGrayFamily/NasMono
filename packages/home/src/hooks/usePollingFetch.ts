import { useCallback, useEffect, useRef, useState } from 'react';

export type PollingFetchState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
};

type UsePollingFetchOptions<T> = {
  fetch: () => Promise<T>;
  enabled?: boolean;
  pollMs?: number;
  /** When this changes, cached data is cleared (e.g. metrics window key). */
  resetKey?: string;
};

export function usePollingFetch<T>({
  fetch: fetchFn,
  enabled = true,
  pollMs = 30_000,
  resetKey,
}: UsePollingFetchOptions<T>): PollingFetchState<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const hasDataRef = useRef(false);

  useEffect(() => {
    hasDataRef.current = false;
    setData(null);
    setError(null);
    setLoading(enabled);
  }, [resetKey, enabled]);

  const load = useCallback(async () => {
    if (!enabled) return;
    const background = hasDataRef.current;
    if (!background) setLoading(true);
    try {
      const result = await fetchFn();
      setData(result);
      setError(null);
      hasDataRef.current = true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [enabled, fetchFn]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled || pollMs <= 0) return;
    const id = globalThis.setInterval(() => void load(), pollMs);
    return () => globalThis.clearInterval(id);
  }, [enabled, pollMs, load]);

  return {
    data,
    error,
    loading,
    refreshing: loading && hasDataRef.current,
    isStale: Boolean(error && data),
    refresh: load,
  };
}
