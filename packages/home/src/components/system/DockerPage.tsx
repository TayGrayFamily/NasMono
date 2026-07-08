import { Button } from '@chakra-ui/react';
import type { JSX } from 'react';
import { useDockerActions } from '@/hooks/useDockerActions';
import type { AdminContainerSummary } from '@/types/admin';
import { sortContainersByAttention } from './containerInsights';
import { ConfirmDialog } from './ConfirmDialog';
import { ContainerCard } from './ContainerCard';
import { DetailPageLayout } from './DetailPageLayout';
import { useSystemContext } from './SystemProvider';
import './ContainerCard.css';
import './SystemPage.css';

type ContainerSection = {
  id: string;
  title: string;
  items: AdminContainerSummary[];
};

function groupContainers(items: AdminContainerSummary[]): ContainerSection[] {
  const sorted = sortContainersByAttention(items);
  const sections: ContainerSection[] = [
    { id: 'updates', title: 'Updates available', items: [] },
    { id: 'restarting', title: 'Restarting', items: [] },
    { id: 'crashed', title: 'Crashed / exited', items: [] },
    { id: 'unhealthy', title: 'Unhealthy', items: [] },
    { id: 'recent', title: 'Recent restarts', items: [] },
    { id: 'stopped', title: 'Stopped', items: [] },
    { id: 'healthy', title: 'Healthy', items: [] },
  ];

  for (const c of sorted) {
    if (c.updateAvailable) {
      sections[0]!.items.push(c);
      continue;
    }
    switch (c.attention) {
      case 'restarting':
        sections[1]!.items.push(c);
        break;
      case 'crashed':
        sections[2]!.items.push(c);
        break;
      case 'unhealthy':
        sections[3]!.items.push(c);
        break;
      case 'recent_restart':
        sections[4]!.items.push(c);
        break;
      case 'stopped':
      case 'created':
        sections[5]!.items.push(c);
        break;
      default:
        sections[6]!.items.push(c);
    }
  }

  return sections.filter((s) => s.items.length > 0);
}

export function DockerPage(): JSX.Element {
  const { data, refresh } = useSystemContext();
  const actions = useDockerActions(refresh);

  if (!data) {
    return <DetailPageLayout title="Docker">{null}</DetailPageLayout>;
  }

  const sections = groupContainers(data.containers.items);
  const { running, total, restarting, crashed, unhealthy, stopped, updatesAvailable } =
    data.containers;
  const { adminActions, stackUpdateContainerMatch, composeManagerStackUrl } = data.capabilities;
  const updateSection = sections.find((s) => s.id === 'updates');
  const statusSections = sections.filter((s) => s.id !== 'updates');

  return (
    <DetailPageLayout title="Docker">
      <p className="detail-summary">
        {running}/{total} running
        {updatesAvailable > 0 ? ` · ${updatesAvailable} updates available` : ''}
        {restarting > 0 ? ` · ${restarting} restarting` : ''}
        {crashed > 0 ? ` · ${crashed} crashed` : ''}
        {unhealthy > 0 ? ` · ${unhealthy} unhealthy` : ''}
        {stopped > 0 ? ` · ${stopped} stopped` : ''}
      </p>

      {adminActions ? (
        <div className="docker-toolbar-actions">
          <ConfirmDialog
            title="Update all outdated containers?"
            confirmLabel="Update all"
            loading={actions.busy === 'update-all'}
            onConfirm={() => void actions.updateOutdated()}
            trigger={(open) => (
              <Button size="sm" variant="outline" onClick={open}>
                Update all outdated
              </Button>
            )}
          >
            <p>
              Pull the latest images and recreate every container Unraid reports as having updates
              available.
            </p>
          </ConfirmDialog>

          {stackUpdateContainerMatch ? (
            <ConfirmDialog
              title="Update NasMono stack?"
              confirmLabel="Update stack"
              loading={actions.busy === 'update-stack'}
              onConfirm={() => void actions.updateStack()}
              trigger={(open) => (
                <Button size="sm" colorPalette="teal" variant="outline" onClick={open}>
                  Update NasMono stack
                </Button>
              )}
            >
              <p>
                Update all stack services matching the configured name pattern. The dashboard may
                reload while <strong>web_app</strong> restarts.
              </p>
            </ConfirmDialog>
          ) : null}

          {composeManagerStackUrl ? (
            <a
              className="launch-button"
              href={composeManagerStackUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Compose Manager
            </a>
          ) : null}
        </div>
      ) : null}

      {actions.lastError ? <p className="docker-action-error">{actions.lastError}</p> : null}

      {updateSection ? (
        <section id="updates" className="docker-updates-section docker-detail-section">
          <h2 className="docker-detail-section-title">
            {updateSection.title}
            <span className="docker-detail-section-count">{updateSection.items.length}</span>
          </h2>
          <div className="detail-scroll-grid">
            {updateSection.items.map((c) => (
              <ContainerCard
                key={c.id}
                container={c}
                adminActionsEnabled={adminActions}
                busyKey={actions.busy}
                onRefreshDigests={() => void actions.refreshDigests()}
                onUpdate={(container) => void actions.updateContainer(container.id)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {statusSections.map((section) => (
        <section key={section.id} className="docker-detail-section">
          <h2 className="docker-detail-section-title">
            {section.title}
            <span className="docker-detail-section-count">{section.items.length}</span>
          </h2>
          <div className="detail-scroll-grid">
            {section.items.map((c) => (
              <ContainerCard
                key={c.id}
                container={c}
                adminActionsEnabled={adminActions}
                busyKey={actions.busy}
                onRefreshDigests={() => void actions.refreshDigests()}
                onUpdate={(container) => void actions.updateContainer(container.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </DetailPageLayout>
  );
}
