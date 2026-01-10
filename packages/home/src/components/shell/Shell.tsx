import { Fragment, type JSX } from 'react';
import { Toolbar } from './Toolbar';

export type ShellProps = {
  children: JSX.Element;
};

export function Shell({ children }: ShellProps): JSX.Element {
  return (
    <Fragment>
      <Toolbar />
      {children}
    </Fragment>
  );
}
