import { IconButton } from '@chakra-ui/react';
import type { JSX } from 'react';
import { LuMenu } from 'react-icons/lu';

export function MenuButton(_props: object): JSX.Element {
  return (
    <IconButton aria-label="open menu">
      <LuMenu />
    </IconButton>
  );
}
