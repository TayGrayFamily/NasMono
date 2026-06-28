import { useEffect, useState, type JSX } from 'react';
import type { LaunchPadResponse } from '@/types/launchpad';
import { AppTile } from './AppTile';
import { ContainerTile } from './ContainerTile';
import '../shell/Shell.css';

export function LaunchPad(): JSX.Element {
  const [data, setData] = useState<LaunchPadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/launchpad')
      .then(async (r) => {
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          throw new Error((body as { error?: string }).error ?? r.statusText);
        }
        return r.json() as Promise<LaunchPadResponse>;
      })
      .then((response) => {
        if (!cancelled) {
          setData(response);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div
        style={{
          padding: '40px',
          textAlign: 'center',
          color: 'var(--status-red)',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <h2>Could not load launchpad</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (data === null) {
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

  const { apps, otherServices } = data;

  return (
    <div className="launchpad-container">
      <section>
        <h2 className="section-title">Web Applications</h2>
        <div className="container-grid">
          {apps.map((app) => (
            <AppTile app={app} key={app.id} />
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
