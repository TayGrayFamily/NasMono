import { useState, type JSX } from 'react';
import { FetchStatusBanner } from '@/components/shared/FetchStatusBanner';
import { ModuleLoadError } from '@/components/shared/FetchStatusBanner';
import { useLaunchpad } from '@/hooks/useLaunchpad';
import { AppTile } from './AppTile';
import { ContainerTile } from './ContainerTile';
import '../shell/Shell.css';

export function LaunchPad(): JSX.Element {
  const { data, error, loading, refreshing, isStale, refresh } = useLaunchpad();
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  if (error && !data) {
    return (
      <div className="launchpad-state-wrap">
        <ModuleLoadError
          title="Could not load LaunchPad"
          error={error}
          onRetry={refresh}
          retrying={loading}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="launchpad-state-wrap">
        <div className="loading-spinner" />
        <p className="launchpad-loading-text">Synchronizing with Docker daemon...</p>
      </div>
    );
  }

  const { apps, otherServices } = data;

  return (
    <div className="launchpad-container">
      {isStale ? (
        <FetchStatusBanner
          message="LaunchPad refresh failed"
          detail={`${error} — showing last successful tiles.`}
          onRetry={refresh}
          retrying={refreshing}
        />
      ) : null}

      <section>
        <h2 className="section-title">Web Applications</h2>
        {apps.length === 0 ? (
          <p className="launchpad-empty-hint">No curated apps configured.</p>
        ) : (
          <div className="container-grid">
            {apps.map((app) => (
              <AppTile app={app} key={app.id} />
            ))}
          </div>
        )}
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
