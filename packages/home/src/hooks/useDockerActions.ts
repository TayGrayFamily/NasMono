import { useCallback, useState } from 'react';

type ActionResult = {
  ok: boolean;
  error?: string;
  warnings?: string[];
};

async function postJson<T>(url: string): Promise<{ data?: T; error?: string }> {
  try {
    const res = await fetch(url, { method: 'POST' });
    const body = (await res.json()) as T & { error?: string };
    if (!res.ok) {
      return { error: body.error ?? `HTTP ${res.status}` };
    }
    return { data: body };
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) };
  }
}

export function useDockerActions(refresh: () => Promise<void>) {
  const [busy, setBusy] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  const run = useCallback(
    async (key: string, url: string): Promise<ActionResult> => {
      setBusy(key);
      setLastError(null);
      const { data, error } = await postJson<{ ok: boolean; warnings?: string[] }>(url);
      setBusy(null);
      if (error) {
        setLastError(error);
        return { ok: false, error };
      }
      await refresh();
      return { ok: data?.ok ?? true, warnings: data?.warnings };
    },
    [refresh],
  );

  const refreshDigests = useCallback(
    () => run('refresh', '/api/admin/docker/refresh-digests'),
    [run],
  );

  const updateContainer = useCallback(
    (id: string) =>
      run(`update-${id}`, `/api/admin/docker/containers/${encodeURIComponent(id)}/update`),
    [run],
  );

  const updateOutdated = useCallback(
    () => run('update-all', '/api/admin/docker/update-outdated'),
    [run],
  );

  const updateStack = useCallback(
    () => run('update-stack', '/api/admin/docker/update-stack'),
    [run],
  );

  return {
    busy,
    lastError,
    refreshDigests,
    updateContainer,
    updateOutdated,
    updateStack,
  };
}
