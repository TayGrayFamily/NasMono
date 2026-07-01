import { Button } from '@chakra-ui/react';
import { useMemo, type JSX } from 'react';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import { useDockerActions } from '@/hooks/useDockerActions';
import { useTemperatureAnalytics } from '@/hooks/useTemperatureAnalytics';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { buildControlPanelReport } from './controlPanelHealth';
import { AlertsGroupPanel } from './AlertsGroup';
import { ConfirmDialog } from './ConfirmDialog';
import { DockerGroupPanel } from './DockerGroup';
import { GroupPanel } from './GroupPanel';
import { useSystemContext } from './SystemProvider';
import '../shell/Shell.css';
import './ControlPanel.css';

export function ControlPanel(): JSX.Element {
  const { data, error, loading, refresh } = useSystemContext();
  const actions = useDockerActions(refresh);
  const { data: tempData } = useTemperatureAnalytics('24h', Boolean(data));
  const { data: metricsData } = useMetricsHistory('24h', Boolean(data));

  const report = useMemo(() => {
    if (!data) return null;
    return buildControlPanelReport(data, tempData ?? undefined, metricsData ?? undefined);
  }, [data, tempData, metricsData]);

  if (error && !data) {
    return (
      <div className="control-panel-error">
        <p>{error}</p>
        <Button size="sm" variant="outline" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || !report) {
    return (
      <div className="control-panel-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="control-panel-wrap">
      <header className="control-panel-toolbar">
        <span className="control-panel-host">{report.hostname}</span>
        <div className="control-panel-actions">
          {data.capabilities.adminActions && data.capabilities.stackUpdateContainerMatch ? (
            <ConfirmDialog
              title="Update NasMono stack?"
              confirmLabel="Update stack"
              loading={actions.busy === 'update-stack'}
              onConfirm={() => void actions.updateStack()}
              trigger={(open) => (
                <Button size="sm" colorPalette="teal" variant="outline" onClick={open}>
                  Update stack
                </Button>
              )}
            >
              <p>
                Update all configured stack services. The dashboard may reload while{' '}
                <strong>web_app</strong> restarts.
              </p>
            </ConfirmDialog>
          ) : null}
          <a
            className="launch-button"
            href={UNRAID_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Unraid
          </a>
          <Button size="sm" variant="outline" onClick={() => void refresh()} loading={loading}>
            Refresh
          </Button>
        </div>
      </header>

      <div className="control-panel">
        {report.groups.map((group) =>
          group.id === 'alerts' ? (
            <AlertsGroupPanel
              key={group.id}
              severity={group.severity}
              items={data.notifications.items}
              apiWarnings={data.warnings}
              archived={data.notifications.archived}
            />
          ) : group.id === 'docker' ? (
            <DockerGroupPanel
              key={group.id}
              severity={group.severity}
              containers={data.containers}
            />
          ) : (
            <GroupPanel
              key={group.id}
              groupId={group.id}
              title={group.title}
              severity={group.severity}
              cards={group.cards}
              layout={group.id === 'system' ? 'metrics' : 'stack'}
            />
          ),
        )}
      </div>
    </div>
  );
}
