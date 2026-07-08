import { SectionFetchState } from '@/components/shared/SectionFetchState';
import { useState, type JSX } from 'react';
import { severityFromPercent } from '@/constants/statusThresholds';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import {
  METRICS_WINDOW_OPTIONS,
  type MetricsAnalytics,
  type MetricsWindowKey,
} from '@/types/metrics';
import { pctThresholds } from './healthChecks';
import { formatDuration } from './formatUtils';
import { DetailPageLayout } from './DetailPageLayout';
import { MemoryBreakdown } from './MemoryBreakdown';
import { MetricChart } from './MetricChart';
import { memorySummaryLine } from './memoryAccounting';
import { ProgressBar, StatCard } from './StatCard';
import { useSystemContext } from './SystemProvider';
import './MetricChart.css';
import './SystemPage.css';

function MetricStatsRow({
  current,
  min,
  max,
  avg,
  unit,
}: {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
  unit: string;
}): JSX.Element {
  const fmt = (v: number | null) => (v != null ? `${v}${unit}` : '—');

  return (
    <div className="metrics-stats-row">
      <div className="metrics-stat">
        <div className="metrics-stat-label">Now</div>
        <div className="metrics-stat-value">{fmt(current)}</div>
      </div>
      <div className="metrics-stat">
        <div className="metrics-stat-label">Low</div>
        <div className="metrics-stat-value">{fmt(min)}</div>
      </div>
      <div className="metrics-stat">
        <div className="metrics-stat-label">High</div>
        <div className="metrics-stat-value">{fmt(max)}</div>
      </div>
      <div className="metrics-stat">
        <div className="metrics-stat-label">Avg</div>
        <div className="metrics-stat-value">{fmt(avg)}</div>
      </div>
    </div>
  );
}

function metricsHistoryHint(metrics: MetricsAnalytics, windowLabel: string): string {
  if (metrics.collecting) {
    return 'Collecting history — one sample every 5 minutes. Charts appear after the second sample.';
  }

  const span = formatDuration(metrics.historySpanMs);
  const count = `${metrics.sampleCount} sample${metrics.sampleCount === 1 ? '' : 's'}`;

  if (metrics.historySpanMs < metrics.windowMs * 0.9) {
    return `${span} of data (${count}) — less than the ${windowLabel} window, so 6h / 24h / 48h look the same until more history builds up.`;
  }

  return `${span} of data · ${count} · ${windowLabel} window`;
}

export function ResourcesPage(): JSX.Element {
  const { data } = useSystemContext();
  const [windowKey, setWindowKey] = useState<MetricsWindowKey>('24h');
  const {
    data: metrics,
    error: metricsError,
    loading: metricsLoading,
    refreshing: metricsRefreshing,
    isStale: metricsStale,
    refresh: refreshMetrics,
  } = useMetricsHistory(windowKey, Boolean(data));

  if (!data) {
    return <DetailPageLayout title="Resources">{null}</DetailPageLayout>;
  }

  const limits = pctThresholds(data);
  const windowLabel = METRICS_WINDOW_OPTIONS.find((o) => o.key === windowKey)?.label ?? windowKey;
  const cpuPct = Math.round(data.metrics.cpuPercent);
  const memPct = Math.round(data.metrics.memoryPercent);
  const availPct =
    data.metrics.memoryTotal > 0
      ? Math.round((data.metrics.memoryAvailable / data.metrics.memoryTotal) * 100)
      : 0;
  const pressurePct = 100 - availPct;
  const cpuSev = severityFromPercent(cpuPct, limits);
  const memSev = severityFromPercent(pressurePct, limits);

  const cpuHistory = metrics?.window === windowKey ? metrics.cpu : undefined;
  const memHistory = metrics?.window === windowKey ? metrics.memory : undefined;
  const metricsReady = metrics?.window === windowKey;
  const memRange =
    memHistory?.min != null && memHistory?.max != null ? memHistory.max - memHistory.min : null;

  return (
    <DetailPageLayout title="Resources">
      <section className="detail-section">
        <h2 className="detail-section-title">History</h2>
        <div className="metrics-window-picker">
          {METRICS_WINDOW_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              className={`metrics-window-btn${windowKey === key ? ' metrics-window-btn--active' : ''}`}
              onClick={() => setWindowKey(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <SectionFetchState
          label="Metrics history"
          error={metricsError}
          loading={metricsLoading}
          ready={metricsReady}
          isStale={metricsStale}
          onRetry={refreshMetrics}
          retrying={metricsRefreshing}
          unavailableMessage="Charts are unavailable until metrics history loads."
        >
          {metrics ? (
            <p className="metrics-history-hint">{metricsHistoryHint(metrics, windowLabel)}</p>
          ) : null}
          <div className={metricsRefreshing ? 'metrics-history-loading' : undefined}>
            <div className="metric-history-block">
              <h3 className="metric-history-block-title">CPU</h3>
              <MetricStatsRow
                current={cpuHistory?.current ?? cpuPct}
                min={cpuHistory?.min ?? null}
                max={cpuHistory?.max ?? null}
                avg={cpuHistory?.avg ?? null}
                unit="%"
              />
              <MetricChart
                label={windowLabel}
                samples={cpuHistory?.samples ?? []}
                warnAt={limits.warn}
                criticalAt={limits.critical}
              />
            </div>

            <div className="metric-history-block">
              <h3 className="metric-history-block-title">Memory</h3>
              <p className="metric-history-block-caption">
                Chart tracks Unraid <strong>used / total</strong> ({memPct}% now).
                &ldquo;Used&rdquo; includes reclaimable cache, so the % stays high even when plenty
                of RAM is free for apps ({availPct}% available).
              </p>
              <MemoryBreakdown metrics={data.metrics} />
              <MetricStatsRow
                current={memHistory?.current ?? memPct}
                min={memHistory?.min ?? null}
                max={memHistory?.max ?? null}
                avg={memHistory?.avg ?? null}
                unit="%"
              />
              <MetricChart
                label={
                  memRange != null && memRange < 5
                    ? `${windowLabel} · zoomed (${memRange.toFixed(1)}% range)`
                    : windowLabel
                }
                samples={memHistory?.samples ?? []}
                warnAt={80}
                criticalAt={95}
                yDomain={memRange != null && memRange < 5 ? 'auto' : 'percent'}
              />
            </div>
          </div>
        </SectionFetchState>
      </section>

      <section className="detail-section">
        <h2 className="detail-section-title">Now</h2>
        <div className="detail-scroll-grid">
          <StatCard
            title="CPU"
            value={`${cpuPct}%`}
            detail={
              cpuHistory?.min != null && cpuHistory?.max != null
                ? `${cpuHistory.min}–${cpuHistory.max}% over ${windowKey}`
                : data.system.cpuBrand
            }
            severity={cpuSev}
            footer={<ProgressBar percent={cpuPct} severity={cpuSev} label="Load" />}
          />
          <StatCard
            title="Memory"
            value={`${memPct}% used`}
            detail={memorySummaryLine(data.metrics)}
            severity={memSev}
            footer={
              <ProgressBar percent={availPct} severity={memSev} label={`${availPct}% available`} />
            }
          />
        </div>
      </section>

      <section className="detail-section">
        <h2 className="detail-section-title">Services</h2>
        <div className="detail-scroll-grid">
          {data.services.map((svc) => (
            <StatCard
              key={svc.name}
              title={svc.name}
              value={svc.online ? 'Online' : 'Offline'}
              detail={svc.version ?? undefined}
              severity={svc.online ? 'ok' : 'warn'}
            />
          ))}
        </div>
      </section>
    </DetailPageLayout>
  );
}
