import { Grid, GridItem } from '@chakra-ui/react';
import type { JSX } from 'react';
import { Toolbar } from './Toolbar';
import { LaunchPad } from '../lauchpad/LaunchPad';

export function App(): JSX.Element {
  return (
    <Grid templateRows="50px 1fr" height="100%" width="100%">
      <GridItem>
        <Toolbar />
      </GridItem>
      <GridItem>
        <LaunchPad />
      </GridItem>
    </Grid>
  );
}
