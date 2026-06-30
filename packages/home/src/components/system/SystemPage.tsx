import { Button } from '@chakra-ui/react';
import { useMemo, type JSX } from 'react';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import { useAdminOverview } from '@/hooks/useAdminOverview';
import type { AdminOverview } from '@/types/admin';
import { CollapsibleSection } from './CollapsibleSection';
import { HealthBanner } from './HealthBanner';
import { StatCard } from './StatCard';
import { buildHealthReport } from './systemHealth';
import '../shell/Shell.css';
import './SystemPage.css';

function AttentionList({
  items,
}: {
  items: ReturnType<typeof buildHealthReport>['attention'];
}): JSX.Element {
  if (items.length === 0) {
    return (
      <StatCard
        title="No issues"
        value="Healthy"
        detail="Nothing needs attention right now."
        severity="ok"
      />
    );
  }

  return (
    <div className="stat-grid stat-grid--attention">
      {items.map((item) => (
        <StatCard key={item.id} title={item.title} value={item.detail} severity={item.severity} />
      ))}
    </div>
  );
}

function HealthyList({
  items,
}: {
  items: ReturnType<typeof buildHealthReport>['healthy'];
}): JSX.Element {
  return (
    <div className="stat-grid stat-grid--compact">
      {items.map((item) => (
        <StatCard key={item.id} title={item.title} value="OK" detail={item.detail} severity="ok" />
      ))}
    </div>
  );
}

function SystemContent({
  data,
  error,
  loading,
  onRefresh,
}: {
  data: AdminOverview | null;
  error: string | null;
  loading: boolean;
  onRefresh: () => void;
}): JSX.Element {
  const report = useMemo(() => (data ? buildHealthReport(data) : null), [data]);

  if (error && !data) {
    return (
      <div className="system-page-error">
        <p>{error}</p>
        <Button size="sm" variant="outline" onClick={onRefresh}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data || !report) {
    return (
      <div className="system-page-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="system-page">
      <header className="system-page-header">
        <h1 className="system-page-title">System</h1>
        <div className="system-page-actions">
          <a
            className="launch-button"
            href={UNRAID_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Unraid
          </a>
          <Button size="sm" variant="outline" onClick={onRefresh} loading={loading}>
            Refresh
          </Button>
        </div>
      </header>

      <HealthBanner hostname={data.system.hostname} report={report} />

      <section className="system-section">
        <h2 className="system-section-title">Needs attention</h2>
        <AttentionList items={report.attention} />
      </section>

      {report.healthy.length > 0 ? (
        <CollapsibleSection
          title="Healthy"
          count={report.healthy.length}
          defaultOpen={report.attention.length === 0}
        >
          <HealthyList items={report.healthy} />
        </CollapsibleSection>
      ) : null}
    </div>
  );
}

export function SystemPage(): JSX.Element {
  const { data, error, loading, refresh } = useAdminOverview();

  return (
    <main className="system-page-wrap">
      <SystemContent data={data} error={error} loading={loading} onRefresh={() => void refresh()} />
    </main>
  );
}
