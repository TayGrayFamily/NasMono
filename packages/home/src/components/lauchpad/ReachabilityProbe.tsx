import { Text } from '@chakra-ui/react';
import { useEffect, useState, type JSX } from 'react';
import { getProbeForHostPort } from './probeForPort';

export type ReachabilityProbeProps = {
  openUrl: string;
  hostPort: number;
};

export function ReachabilityProbe(props: ReachabilityProbeProps): JSX.Element {
  const { openUrl, hostPort } = props;
  const [reachable, setReachable] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    const probe = getProbeForHostPort(hostPort);
    if (probe) {
      probe().then((ok) => {
        if (!cancelled) setReachable(ok);
      });
      return () => {
        cancelled = true;
      };
    }

    const ac = new AbortController();
    fetch(openUrl, { method: 'GET', signal: ac.signal, mode: 'cors' })
      .then((r) => {
        if (!cancelled) setReachable(r.ok);
      })
      .catch(() => {
        if (!cancelled) setReachable(false);
      });
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [openUrl, hostPort]);

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
