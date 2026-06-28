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
  const dimmed = app.state !== 'running';

  return (
    <a
      href={app.url}
      target="_blank"
      rel="noopener noreferrer"
      className="container-card container-card-link"
      title={`Open ${app.displayName}`}
      style={{ opacity: dimmed ? 0.65 : 1 }}
    >
      <div className="card-header">
        <div className="card-icon-wrapper">
          <img src={app.iconUrl} alt="" width={48} height={48} />
        </div>

        <div className="card-content">
          <h3 className="card-title">{app.displayName}</h3>
          <span className="card-status" style={{ color: `var(--status-${stateColor(app.state)})` }}>
            {app.state === 'unknown' ? 'no container' : app.state}
          </span>
        </div>
      </div>

      {showProbe ? (
        <div className="card-footer">
          <ReachabilityProbe
            openUrl={app.probeUrl ?? app.url}
            hostPort={app.probeUrl ? undefined : app.hostPort}
          />
        </div>
      ) : null}
    </a>
  );
}
