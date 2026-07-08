import { useCallback, useEffect, useState } from 'react';
import type { AdminOverview } from '@/types/admin';

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
  const [data, setData] = useState<AdminOverview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const overview = await fetchOverview();
      setData(overview);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  return { data, error, loading, refresh: load };
}
