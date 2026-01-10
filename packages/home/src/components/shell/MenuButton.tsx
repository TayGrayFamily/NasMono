import { Icon, IconButton } from '@chakra-ui/react';
import type { JSX } from 'react';
import { LuMenu } from 'react-icons/lu';
import { Button, CloseButton, Drawer, Portal } from '@chakra-ui/react';

export function MenuButton(_props: object): JSX.Element {
  return (
    <Drawer.Root placement="start">
      <Drawer.Trigger asChild>
        <IconButton aria-label="open menu" colorScheme="primary">
          <Icon as={LuMenu} boxSize={6} />
        </IconButton>
      </Drawer.Trigger>
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Drawer.Title>Drawer Title</Drawer.Title>
            </Drawer.Header>
            <Drawer.Body>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua.
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Button variant="outline">Cancel</Button>
              <Button>Save</Button>
            </Drawer.Footer>
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
