import { Text } from '@chakra-ui/react';
import { useEffect, useState, type JSX } from 'react';

export type ReachabilityProbeProps = {
  openUrl: string;
};

/**
 * Reachability is checked from the **app server** (Vite/Node in dev, container in prod), not the
 * browser, so homelab services that omit CORS headers still probe correctly.
 */
export function ReachabilityProbe(props: ReachabilityProbeProps): JSX.Element {
  const { openUrl } = props;
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    const q = `/api/reachability?target=${encodeURIComponent(openUrl)}`;
    fetch(q, { signal: ac.signal })
      .then(async (r) => {
        const body = (await r.json().catch(() => ({}))) as { ok?: boolean };
        if (!cancelled) setReachable(body.ok === true);
      })
      .catch(() => {
        if (!cancelled) setReachable(false);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [openUrl]);

  if (reachable === null) {
    return (
      <Text fontSize="sm" color="fg.muted">
        Checking reachability…
      </Text>
    );
  }
  if (reachable) {
    return (
      <Text fontSize="sm" color="green.solid">
        Responding
      </Text>
    );
  }
  return (
    <Text fontSize="sm" color="red.solid">
      Not responding
    </Text>
  );
}
