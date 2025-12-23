import { Box, HStack } from '@chakra-ui/react';
import type { JSX } from 'react';
import { ColorModeToggle } from './ColorModeToggle';

export function Toolbar(_props: object): JSX.Element {
  return (
    <HStack padding={2} borderBottom="1px solid" borderColor="gray.200" h="50px">
      <Box flex={1} />
      <ColorModeToggle />
    </HStack>
  );
}
