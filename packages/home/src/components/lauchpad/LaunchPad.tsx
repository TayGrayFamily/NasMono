import { useEffect, useState, type JSX, useMemo } from 'react';
import type { ContainerRow } from '@/types/dockerContainer';
import { ContainerTile } from './ContainerTile';
import '../shell/Shell.css';

export function LaunchPad(): JSX.Element {
  const [containers, setContainers] = useState<ContainerRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/containers')
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? r.statusText);
        }
        return r.json() as Promise<ContainerRow[]>;
      })
      .then((rows) => {
        if (!cancelled) {
          setContainers(rows);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const { webApps, otherServices } = useMemo(() => {
    if (!containers) return { webApps: [], otherServices: [] };

    const apps: ContainerRow[] = [];
    const others: ContainerRow[] = [];

    // Known services that expose a port but don't have a browseable Web UI
    const API_ONLY_SERVICES = /flaresolverr|database|postgres|redis|mongo|mysql|mariadb|api-only/i;

    for (const c of containers) {
      const isApiOnly = API_ONLY_SERVICES.test(c.name) || API_ONLY_SERVICES.test(c.image);
      if (c.primaryPort && !isApiOnly) {
        apps.push(c);
      } else {
        others.push(c);
      }
    }

    const sortFn = (a: ContainerRow, b: ContainerRow) => {
      if (a.state === 'running' && b.state !== 'running') return -1;
      if (a.state !== 'running' && b.state === 'running') return 1;
      return a.name.localeCompare(b.name);
    };

    return {
      webApps: apps.sort(sortFn),
      otherServices: others.sort(sortFn),
    };
  }, [containers]);

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--status-red)' }}>
        <h2>Could not load containers</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (containers === null) {
    return (
      <div
        style={{
          padding: '100px',
          textAlign: 'center',
          color: 'var(--color-text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div className="loading-spinner" />
        <p>Synchronizing with Docker daemon...</p>
      </div>
    );
  }

  return (
    <div className="launchpad-container">
      <section>
        <h2 className="section-title">Web Applications</h2>
        <div className="container-grid">
          {webApps.map((c) => (
            <ContainerTile container={c} key={c.id} />
          ))}
        </div>
      </section>

      {otherServices.length > 0 && (
        <section className="other-services-section">
          <div className="collapsible-header" onClick={() => setIsServicesOpen(!isServicesOpen)}>
            <div className={`chevron ${isServicesOpen ? 'open' : ''}`}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </div>
            <h2 className="section-title-muted">System Services ({otherServices.length})</h2>
          </div>

          {isServicesOpen && (
            <div className="services-grid">
              {otherServices.map((c) => (
                <ContainerTile container={c} key={c.id} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
