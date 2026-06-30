import { Link } from '@tanstack/react-router';
import type { JSX } from 'react';
import type { Severity } from '@/constants/statusThresholds';
import type { AdminOverview } from '@/types/admin';
import { attentionLabel, attentionSeverity, containersNeedingAttention } from './containerInsights';
import './DockerGroup.css';

type DockerGroupPanelProps = {
  severity: Severity;
  containers: AdminOverview['containers'];
};

export function DockerGroupPanel({ severity, containers }: DockerGroupPanelProps): JSX.Element {
  const attentionItems = containersNeedingAttention(containers.items);
  const issueCount = attentionItems.length;
  const healthyCount = containers.total - issueCount;

  return (
    <section className="group-panel group-panel--docker" aria-label="Docker">
      <header className="group-panel-header">
        <div className="group-panel-heading">
          <span className={`group-panel-dot group-panel-dot--${severity}`} aria-hidden />
          <h2 className="group-panel-title">Docker</h2>
        </div>
        <div className="docker-group-header-meta">
          {issueCount > 0 ? (
            <span className={`group-panel-badge group-panel-badge--${severity}`}>
              {issueCount} need attention
            </span>
          ) : null}
          <Link to="/system/docker" className="docker-group-view-all">
            View all
          </Link>
        </div>
      </header>
      <div className="docker-group-body">
        <div className="docker-group-summary">
          <span className="docker-group-running">
            {containers.running}/{containers.total} running
          </span>
          {containers.restarting > 0 ? (
            <span className="docker-group-stat docker-group-stat--critical">
              {containers.restarting} restarting
            </span>
          ) : null}
          {containers.crashed > 0 ? (
            <span className="docker-group-stat docker-group-stat--critical">
              {containers.crashed} crashed
            </span>
          ) : null}
          {containers.unhealthy > 0 ? (
            <span className="docker-group-stat docker-group-stat--critical">
              {containers.unhealthy} unhealthy
            </span>
          ) : null}
        </div>

        {issueCount === 0 ? (
          <div className="docker-group-healthy">
            <p className="docker-group-healthy-title">All containers stable</p>
            <p className="docker-group-healthy-detail">
              {healthyCount} container{healthyCount === 1 ? '' : 's'} with no restart or crash
              signals
            </p>
          </div>
        ) : (
          <ul className="docker-group-list" aria-label="Containers needing attention">
            {attentionItems.slice(0, 8).map((c) => {
              const itemSeverity = attentionSeverity(c.attention);
              return (
                <li key={c.name}>
                  <Link
                    to="/system/docker"
                    className={`docker-group-item docker-group-item--${itemSeverity}`}
                  >
                    <span className="docker-group-item-name" title={c.name}>
                      {c.name}
                    </span>
                    <span
                      className={`docker-group-item-label docker-group-item-label--${itemSeverity}`}
                    >
                      {attentionLabel(c.attention)}
                    </span>
                    <span className="docker-group-item-status" title={c.status}>
                      {c.attentionDetail}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {issueCount > 8 ? (
          <Link to="/system/docker" className="docker-group-more">
            +{issueCount - 8} more on detail page
          </Link>
        ) : null}
      </div>
    </section>
  );
}
