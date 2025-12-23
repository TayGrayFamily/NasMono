import type { JSX } from 'react';
import type { LaunchPadItemConfig } from './LaunchPadConfig';
import { Card, VStack } from '@chakra-ui/react';

export type LaunchPadItemProps = {
  config: LaunchPadItemConfig;
};

export function LaunchPadItem(props: LaunchPadItemProps): JSX.Element {
  const { config } = props;

  return (
    <Card.Root>
      <Card.Body>
        <VStack>
          <img src={config.iconUrl} alt={config.displayName} />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}
