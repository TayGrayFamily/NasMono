import { Outlet } from '@tanstack/react-router';
import type { JSX } from 'react';
import { SystemProvider } from '@/components/system/SystemProvider';

export function SystemLayout(): JSX.Element {
  return (
    <SystemProvider>
      <Outlet />
    </SystemProvider>
  );
}
