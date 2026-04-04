import { For, Grid, Spinner, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState, type JSX } from 'react';
import type { ContainerRow } from '@/types/dockerContainer';
import { ContainerTile } from './ContainerTile';

export function LaunchPad(_props: object): JSX.Element {
  const [containers, setContainers] = useState<ContainerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/containers')
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? r.statusText);
        }
        return r.json() as Promise<ContainerRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          const sorted = [...rows].sort((a, b) => {
            if (a.state === 'running' && b.state !== 'running') return -1;
            if (a.state !== 'running' && b.state === 'running') return 1;
            return a.name.localeCompare(b.name);
          });
          setContainers(sorted);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <VStack padding={6} align="stretch">
        <Text color="red.solid">Could not load containers: {error}</Text>
      </VStack>
    );
  }

  if (containers === null) {
    return (
      <VStack padding={10}>
        <Spinner size="lg" />
        <Text color="fg.muted">Loading Docker containers…</Text>
      </VStack>
    );
  }

  return (
    <Grid padding={5} gap={4} height="100%" templateColumns="repeat(auto-fill, minmax(180px, 1fr))">
      <For each={containers}>{(c) => <ContainerTile container={c} key={c.id} />}</For>
    </Grid>
  );
}
