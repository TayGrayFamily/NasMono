import { Badge, Card, Link, Text, VStack } from '@chakra-ui/react';
import { useMemo, type JSX } from 'react';
import type { ContainerRow } from '@/types/dockerContainer';
import { getLaunchHost } from '@/constants/ServerConst';
import { iconUrlForImage } from './launchPadIcons';
import { ReachabilityProbe } from './ReachabilityProbe';

export type ContainerTileProps = {
  container: ContainerRow;
};

function stateColor(state: ContainerRow['state']): string {
  switch (state) {
    case 'running':
      return 'green';
    case 'paused':
      return 'orange';
    case 'exited':
    case 'dead':
      return 'gray';
    case 'restarting':
      return 'yellow';
    default:
      return 'red';
  }
}

export function ContainerTile(props: ContainerTileProps): JSX.Element {
  const { container } = props;

  const openUrl = useMemo(() => {
    const p = container.primaryPort;
    if (!p) return null;
    const host = getLaunchHost();
    const proto = typeof window !== 'undefined' ? window.location.protocol : 'http:';
    return `${proto}//${host}:${p.hostPort}/`;
  }, [container.primaryPort]);

  const iconUrl = iconUrlForImage(container.image);
  const showProbe = !!(openUrl && container.primaryPort && container.state === 'running');

  return (
    <Card.Root>
      {openUrl ? (
        <Link
          href={openUrl}
          target="_blank"
          rel="noopener noreferrer"
          margin="20px"
          opacity={container.state === 'running' ? 1 : 0.45}
        >
          <img
            src={iconUrl}
            alt=""
            width={72}
            height={72}
            style={{ margin: '0 auto', display: 'block' }}
          />
        </Link>
      ) : (
        <Card.Body paddingTop={6}>
          <img
            src={iconUrl}
            alt=""
            width={72}
            height={72}
            style={{ margin: '0 auto', display: 'block', opacity: 0.35 }}
          />
        </Card.Body>
      )}
      <Card.Body>
        <VStack align="stretch" gap={1}>
          <Card.Title fontSize="md">{container.name}</Card.Title>
          <Badge colorPalette={stateColor(container.state)} width="fit-content">
            {container.state}
          </Badge>
          <Text fontSize="xs" color="fg.muted" lineClamp={2}>
            {container.image}
          </Text>
          {!openUrl && container.state === 'running' ? (
            <Text fontSize="sm" color="fg.muted">
              No published TCP port — open link unavailable
            </Text>
          ) : null}
          {container.primaryPortLoopbackOnly && openUrl ? (
            <Text fontSize="sm" color="orange.solid">
              Bound to loopback only — may not work from other devices (Tailscale)
            </Text>
          ) : null}
          {showProbe && container.primaryPort ? (
            <ReachabilityProbe openUrl={openUrl!} hostPort={container.primaryPort.hostPort} />
          ) : null}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
