import { useState, type JSX } from 'react';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import {
  METRICS_WINDOW_OPTIONS,
  type MetricsAnalytics,
  type MetricsWindowKey,
} from '@/types/metrics';
import type { AdminUpsDevice } from '@/types/admin';
import { formatDuration } from './formatUtils';
import { powerSeverity, upsDeviceSeverity } from './healthChecks';
import { DetailPageLayout } from './DetailPageLayout';
import { MetricChart } from './MetricChart';
import { ProgressBar, StatCard } from './StatCard';
import { useSystemContext } from './SystemProvider';
import './MetricChart.css';
import './SystemPage.css';

function formatUpsStatus(status: string): string {
  const normalized = status.toUpperCase();
  if (normalized === 'ONLINE' || normalized === 'OL') return 'Mains power';
  if (normalized.includes('BATTERY') || normalized === 'ONBATT' || normalized === 'OB') {
    return 'On battery';
  }
  return status;
}

function formatRuntime(seconds: number): string {
  if (seconds <= 0) return '—';
  return formatDuration(seconds * 1000);
}

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
  if (!metrics.power) {
    return 'Power history builds after Unraid reports UPS wattage on each overview poll (one sample every 5 minutes).';
  }
  if (metrics.collecting) {
    return 'Collecting power history — charts appear after the second sample.';
  }

  const span = formatDuration(metrics.historySpanMs);
  const count = `${metrics.sampleCount} sample${metrics.sampleCount === 1 ? '' : 's'}`;

  if (metrics.historySpanMs < metrics.windowMs * 0.9) {
    return `${span} of data (${count}) — less than the ${windowLabel} window.`;
  }

  return `${span} of data · ${count} · ${windowLabel} window`;
}

function UpsDeviceCard({ device }: { device: AdminUpsDevice }): JSX.Element {
  const severity = upsDeviceSeverity(device);
  const watts = device.powerWatts;
  const loadDetail =
    device.nominalPowerWatts != null
      ? `${device.loadPercent}% of ${device.nominalPowerWatts} W capacity`
      : `${device.loadPercent}% load`;

  return (
    <StatCard
      title={device.name || device.model || 'UPS'}
      value={watts != null ? `${watts} W` : '—'}
      detail={
        <>
          <div>{formatUpsStatus(device.status)}</div>
          <div>{loadDetail}</div>
          {device.inputVoltage != null ? <div>Input: {device.inputVoltage} V</div> : null}
          {device.outputVoltage != null ? <div>Output: {device.outputVoltage} V</div> : null}
          {device.batteryPercent > 0 ? (
            <div>
              Battery: {device.batteryPercent}% · {formatRuntime(device.batteryRuntimeSec)} left
            </div>
          ) : null}
          {device.batteryHealth ? <div>Battery health: {device.batteryHealth}</div> : null}
        </>
      }
      severity={severity}
      footer={
        device.loadPercent > 0 ? (
          <ProgressBar percent={device.loadPercent} severity={severity} label="Load" />
        ) : undefined
      }
    />
  );
}

export function PowerPage(): JSX.Element {
  const { data, error } = useSystemContext();
  const [windowKey, setWindowKey] = useState<MetricsWindowKey>('24h');
  const {
    data: metrics,
    error: metricsError,
    loading: metricsLoading,
  } = useMetricsHistory(windowKey, Boolean(data?.power.available));

  if (error && !data) {
    return (
      <DetailPageLayout title="Power">
        <p className="system-page-error">{error}</p>
      </DetailPageLayout>
    );
  }

  if (!data) {
    return (
      <DetailPageLayout title="Power">
        <div className="system-page-loading">
          <div className="loading-spinner" />
        </div>
      </DetailPageLayout>
    );
  }

  if (!data.power.available) {
    return (
      <DetailPageLayout title="Power">
        <p className="system-page-subtitle">
          No UPS power data from Unraid. Connect your PSU via USB and enable it under{' '}
          <strong>Settings → UPS Settings</strong> on the NAS.
        </p>
      </DetailPageLayout>
    );
  }

  const windowLabel = METRICS_WINDOW_OPTIONS.find((o) => o.key === windowKey)?.label ?? windowKey;
  const watts = data.power.totalWatts;
  const severity = powerSeverity(data);
  const powerHistory = metrics?.power;
  const primaryLoad = data.power.devices[0]?.loadPercent ?? 0;

  return (
    <DetailPageLayout title="Power">
      <section className="detail-section">
        <h2 className="detail-section-title">Now</h2>
        <div className="detail-scroll-grid">
          <StatCard
            title="Total draw"
            value={watts != null ? `${watts} W` : '—'}
            detail={
              data.power.devices.length > 1
                ? `${data.power.devices.length} UPS devices`
                : data.power.devices[0]?.model || undefined
            }
            severity={severity}
            footer={
              primaryLoad > 0 ? (
                <ProgressBar percent={primaryLoad} severity={severity} label="UPS load" />
              ) : undefined
            }
          />
          {data.power.devices.map((device) => (
            <UpsDeviceCard key={device.id} device={device} />
          ))}
        </div>
      </section>

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
        {metrics?.window === windowKey ? (
          <p className="metrics-history-hint">{metricsHistoryHint(metrics, windowLabel)}</p>
        ) : null}
        {metricsError ? <p className="system-page-error">{metricsError}</p> : null}
        {metricsLoading && !metrics ? (
          <div className="system-page-loading">
            <div className="loading-spinner" />
          </div>
        ) : (
          <div className={metricsLoading ? 'metrics-history-loading' : undefined}>
            <div className="metric-history-block">
              <h3 className="metric-history-block-title">Power draw</h3>
              <MetricStatsRow
                current={powerHistory?.current ?? watts}
                min={powerHistory?.min ?? null}
                max={powerHistory?.max ?? null}
                avg={powerHistory?.avg ?? null}
                unit=" W"
              />
              <MetricChart
                label={windowLabel}
                samples={powerHistory?.samples ?? []}
                yDomain="auto"
                unit="W"
              />
            </div>
          </div>
        )}
      </section>
    </DetailPageLayout>
  );
}
