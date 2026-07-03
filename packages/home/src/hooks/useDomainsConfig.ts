import { useCallback, useEffect, useState } from 'react';
import type { DomainsConfig } from '@/types/domains';
import type { DomainsSaveResponse } from '@/types/domains';

async function fetchDomains(): Promise<DomainsConfig> {
  const res = await fetch('/api/admin/domains');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<DomainsConfig>;
}

async function putDomains(config: DomainsConfig): Promise<DomainsSaveResponse> {
  const res = await fetch('/api/admin/domains', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((body as { error?: string }).error ?? res.statusText);
  }
  return body as DomainsSaveResponse;
}

export function useDomainsConfig() {
  const [saved, setSaved] = useState<DomainsConfig | null>(null);
  const [draft, setDraft] = useState<DomainsConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const config = await fetchDomains();
      setSaved(config);
      setDraft(structuredClone(config));
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(async (config: DomainsConfig) => {
    setSaving(true);
    setSaveMessage(null);
    try {
      const result = await putDomains(config);
      setSaved(config);
      setDraft(structuredClone(config));
      setError(null);
      setSaveMessage(result.caddyRestarted ? 'Saved — Caddy restarted.' : 'Saved.');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
      throw e;
    } finally {
      setSaving(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    draft,
    setDraft,
    saved,
    error,
    loading,
    saving,
    saveMessage,
    refresh: load,
    save,
  };
}
