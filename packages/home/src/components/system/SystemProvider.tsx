import { createContext, useContext, type JSX, type ReactNode } from 'react';
import { useAdminOverview } from '@/hooks/useAdminOverview';
import type { AdminOverview } from '@/types/admin';

type SystemContextValue = {
  data: AdminOverview | null;
  error: string | null;
  loading: boolean;
  refreshing: boolean;
  isStale: boolean;
  refresh: () => Promise<void>;
};

const SystemContext = createContext<SystemContextValue | null>(null);

export function SystemProvider({ children }: { children: ReactNode }): JSX.Element {
  const { data, error, loading, refreshing, isStale, refresh } = useAdminOverview();

  return (
    <SystemContext.Provider value={{ data, error, loading, refreshing, isStale, refresh }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystemContext(): SystemContextValue {
  const ctx = useContext(SystemContext);
  if (!ctx) {
    throw new Error('useSystemContext must be used within SystemProvider');
  }
  return ctx;
}
