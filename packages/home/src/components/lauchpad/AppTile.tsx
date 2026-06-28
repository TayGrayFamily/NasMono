import type { JSX } from 'react';
import type { LaunchPadApp } from '@/types/launchpad';
import { ReachabilityProbe } from './ReachabilityProbe';
import '../shell/Shell.css';

export type AppTileProps = {
  app: LaunchPadApp;
};

function stateColor(state: LaunchPadApp['state']): string {
  switch (state) {
    case 'running':
      return 'green';
    case 'paused':
      return 'orange';
    case 'exited':
    case 'dead':
      return 'gray';
    case 'restarting':
      return 'yellow';
    case 'unknown':
      return 'gray';
    default:
      return 'red';
  }
}

export function AppTile(props: AppTileProps): JSX.Element {
  const { app } = props;
  const showProbe = app.state === 'running';

  return (
    <div className="container-card">
      <div className="card-header">
        <div className="card-icon-wrapper">
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ opacity: app.state === 'running' ? 1 : 0.45, display: 'block' }}
          >
            <img src={app.iconUrl} alt="" width={48} height={48} />
          </a>
        </div>

        <div className="card-content">
          <h3 className="card-title">{app.displayName}</h3>
          <span className="card-status" style={{ color: `var(--status-${stateColor(app.state)})` }}>
            {app.state === 'unknown' ? 'no container' : app.state}
          </span>
        </div>

        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="launch-button"
          title="Open Web UI"
        >
          Launch
        </a>
      </div>

      <div className="card-footer">
        {showProbe ? <ReachabilityProbe openUrl={app.url} /> : null}
      </div>
    </div>
  );
}
