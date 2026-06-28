import { Text } from '@chakra-ui/react';
import { useEffect, useState, type JSX } from 'react';

export type ReachabilityProbeProps = {
  openUrl: string;
  hostPort?: number;
};

type ProbeResult = {
  ok: boolean;
  status: number;
  error?: string;
  detail?: string;
  method?: string;
};

/**
 * Reachability is checked from the **app server** (Vite/Node in dev, container in prod), not the
 * browser, so homelab services that omit CORS headers still probe correctly.
 */
export function ReachabilityProbe(props: ReachabilityProbeProps): JSX.Element {
  const { openUrl, hostPort } = props;
  const [result, setResult] = useState<ProbeResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const params = new URLSearchParams({ target: openUrl });
    if (hostPort != null && hostPort > 0) {
      params.set('hostPort', String(hostPort));
    }
    fetch(`/api/reachability?${params}`, { signal: ac.signal })
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as ProbeResult;
        if (!cancelled) setResult(body);
      })
      .catch(() => {
        if (!cancelled) {
          setResult({
            ok: false,
            status: 0,
            error: 'request_failed',
            detail: 'Probe request failed',
          });
        }
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [openUrl, hostPort]);

  if (result === null) {
    return (
      <Text fontSize="sm" color="fg.muted">
        Checking reachability…
      </Text>
    );
  }

  if (result.ok) {
    const via =
      result.method === 'gateway'
        ? 'via host gateway'
        : result.method === 'host_port'
          ? `via host port ${hostPort}`
          : undefined;
    return (
      <Text fontSize="sm" color="green.solid">
        Responding{result.status > 0 ? ` (HTTP ${result.status})` : ''}
        {via ? ` · ${via}` : ''}
      </Text>
    );
  }

  return (
    <Text fontSize="sm" color="red.solid" title={result.detail}>
      Not responding
      {result.error ? ` · ${result.error}` : ''}
      {result.detail ? ` — ${result.detail}` : ''}
    </Text>
  );
}
