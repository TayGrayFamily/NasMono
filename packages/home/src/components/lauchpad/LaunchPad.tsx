import { For, Grid } from '@chakra-ui/react';
import type { JSX } from 'react';
import { launchPadConfig } from './LaunchPadConfig';
import { LaunchPadItem } from './LaunchPadItem';

export function LaunchPad(_props: object): JSX.Element {
  return (
    <Grid padding={5} gap={2} height="100%" templateColumns="repeat(auto-fill, minmax(150px, 1fr))">
      <For each={launchPadConfig}>
        {(item, _index) => <LaunchPadItem config={item} key={item.displayName} />}
      </For>
    </Grid>
  );
}
