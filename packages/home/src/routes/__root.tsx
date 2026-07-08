import * as React from 'react';
import { Outlet, createRootRoute } from '@tanstack/react-router';
import { RouteErrorBoundary } from '@/components/shared/ErrorBoundary';
import { Shell } from '@/components/shell/Shell';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <React.Fragment>
      <Shell>
        <RouteErrorBoundary>
          <Outlet />
        </RouteErrorBoundary>
      </Shell>
    </React.Fragment>
  );
}
