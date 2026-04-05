import { useMemo, type JSX } from 'react';
import type { ContainerRow } from '@/types/dockerContainer';
import { getLaunchHost, getLaunchProtocol } from '@/constants/ServerConst';
import { iconUrlForImage } from './launchPadIcons';
import { ReachabilityProbe } from './ReachabilityProbe';
import '../shell/Shell.css';

export type ContainerTileProps = {
  container: ContainerRow;
};

function stateColor(state: ContainerRow['state']): string {
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
    default:
      return 'red';
  }
}

export function ContainerTile(props: ContainerTileProps): JSX.Element {
  const { container } = props;

  const openUrl = useMemo(() => {
    const p = container.primaryPort;
    if (!p) return null;
    const host = getLaunchHost();
    const proto = getLaunchProtocol();
    return `${proto}//${host}:${p.hostPort}/`;
  }, [container.primaryPort]);

  const iconUrl = iconUrlForImage(container.image);
  const showProbe = !!(openUrl && container.primaryPort && container.state === 'running');
  const isWebApp = !!openUrl;

  return (
    <div className={`container-card ${!isWebApp ? 'service-card' : ''}`}>
      <div className="card-header">
        <div className="card-icon-wrapper">
          {openUrl ? (
            <a
              href={openUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ opacity: container.state === 'running' ? 1 : 0.45, display: 'block' }}
            >
              <img src={iconUrl} alt="" width={isWebApp ? 48 : 24} height={isWebApp ? 48 : 24} />
            </a>
          ) : (
            <img
              src={iconUrl}
              alt=""
              width={isWebApp ? 48 : 24}
              height={isWebApp ? 48 : 24}
              style={{ opacity: 0.35, display: 'block' }}
            />
          )}
        </div>

        <div className="card-content">
          <h3 className="card-title">{container.name}</h3>
          <span
            className="card-status"
            style={{ color: `var(--status-${stateColor(container.state)})` }}
          >
            {container.state}
          </span>
        </div>

        {isWebApp && openUrl && (
          <a
            href={openUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="launch-button"
            title="Open Web UI"
          >
            Launch
          </a>
        )}
      </div>

      {isWebApp && (
        <div className="card-footer">
          {container.primaryPortLoopbackOnly && openUrl ? (
            <p style={{ fontSize: '0.8rem', color: '#ffb74d', margin: '8px 0' }}>
              Bound to loopback only
            </p>
          ) : null}
          {showProbe && openUrl ? <ReachabilityProbe openUrl={openUrl} /> : null}
        </div>
      )}
    </div>
  );
}
