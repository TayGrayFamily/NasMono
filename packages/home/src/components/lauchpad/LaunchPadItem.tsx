import { useEffect, useState, type JSX } from 'react';
import type { LaunchPadItemConfig } from './LaunchPadConfig';
import { Card, Link, VStack } from '@chakra-ui/react';

import { serverIp } from '../../constants/ServerConst';

export type LaunchPadItemProps = {
  config: LaunchPadItemConfig;
};

export function LaunchPadItem(props: LaunchPadItemProps): JSX.Element {
  const { config } = props;
  const [isOnline, setIsOnline] = useState<boolean | null>(null);

  const url = 'http://' + serverIp + ':' + config.port + '/' + (config.params ? config.params : '');

  useEffect(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          console.error(`Service ${config.displayName} is not reachable.`);
          setIsOnline(false);
        } else {
          setIsOnline(true);
        }
      })
      .catch((error) => {
        console.error(`Error reaching service ${config.displayName}:`, error);
        setIsOnline(false);
      });
  });

  return (
    <Card.Root>
      <Link href={url} target="_blank" rel="noopener noreferrer" margin="20px">
        <img src={config.iconUrl} alt={config.displayName} />
      </Link>
      <Card.Body>
        <VStack>
          <Card.Title>{config.displayName}</Card.Title>
          {/* <Card.Description>{config.description}</Card.Description> */}
          {isOnline === null ? (
            <Card.Description>Checking...</Card.Description>
          ) : isOnline ? (
            <Card.Description>Online</Card.Description>
          ) : (
            <Card.Description>Offline</Card.Description>
          )}
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
