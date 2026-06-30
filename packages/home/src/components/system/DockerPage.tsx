import type { JSX } from 'react';
import type { AdminContainerSummary } from '@/types/admin';
import { attentionLabel, attentionSeverity, sortContainersByAttention } from './containerInsights';
import { DetailPageLayout } from './DetailPageLayout';
import { StatCard } from './StatCard';
import { useSystemContext } from './SystemProvider';
import './SystemPage.css';

type ContainerSection = {
  id: string;
  title: string;
  items: AdminContainerSummary[];
};

function groupContainers(items: AdminContainerSummary[]): ContainerSection[] {
  const sorted = sortContainersByAttention(items);
  const sections: ContainerSection[] = [
    { id: 'restarting', title: 'Restarting', items: [] },
    { id: 'crashed', title: 'Crashed / exited', items: [] },
    { id: 'unhealthy', title: 'Unhealthy', items: [] },
    { id: 'recent', title: 'Recent restarts', items: [] },
    { id: 'stopped', title: 'Stopped', items: [] },
    { id: 'healthy', title: 'Healthy', items: [] },
  ];

  for (const c of sorted) {
    switch (c.attention) {
      case 'restarting':
        sections[0]!.items.push(c);
        break;
      case 'crashed':
        sections[1]!.items.push(c);
        break;
      case 'unhealthy':
        sections[2]!.items.push(c);
        break;
      case 'recent_restart':
        sections[3]!.items.push(c);
        break;
      case 'stopped':
      case 'created':
        sections[4]!.items.push(c);
        break;
      default:
        sections[5]!.items.push(c);
    }
  }

  return sections.filter((s) => s.items.length > 0);
}

export function DockerPage(): JSX.Element {
  const { data, error } = useSystemContext();

  if (error && !data) {
    return (
      <DetailPageLayout title="Docker">
        <p className="system-page-error">{error}</p>
      </DetailPageLayout>
    );
  }

  if (!data) {
    return (
      <DetailPageLayout title="Docker">
        <div className="system-page-loading">
          <div className="loading-spinner" />
        </div>
      </DetailPageLayout>
    );
  }

  const sections = groupContainers(data.containers.items);
  const { running, total, restarting, crashed, unhealthy, stopped } = data.containers;

  return (
    <DetailPageLayout title="Docker">
      <p className="detail-summary">
        {running}/{total} running
        {restarting > 0 ? ` · ${restarting} restarting` : ''}
        {crashed > 0 ? ` · ${crashed} crashed` : ''}
        {unhealthy > 0 ? ` · ${unhealthy} unhealthy` : ''}
        {stopped > 0 ? ` · ${stopped} stopped` : ''}
      </p>
      {sections.map((section) => (
        <section key={section.id} className="docker-detail-section">
          <h2 className="docker-detail-section-title">
            {section.title}
            <span className="docker-detail-section-count">{section.items.length}</span>
          </h2>
          <div className="detail-scroll-grid">
            {section.items.map((c) => {
              const severity = attentionSeverity(c.attention);
              return (
                <StatCard
                  key={c.name}
                  title={c.name}
                  value={attentionLabel(c.attention)}
                  detail={c.status}
                  severity={severity}
                />
              );
            })}
          </div>
        </section>
      ))}
    </DetailPageLayout>
  );
}
