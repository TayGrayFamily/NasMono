import { useState, type JSX } from 'react';
import { SectionFetchState } from '@/components/shared/SectionFetchState';
import { useTemperatureAnalytics } from '@/hooks/useTemperatureAnalytics';
import {
  TEMP_ROLE_LABELS,
  TEMP_WINDOW_OPTIONS,
  type TempSensorRole,
  type TempSensorStats,
  type TempWindowKey,
} from '@/types/temperature';
import { formatDuration } from './formatUtils';
import { DetailPageLayout } from './DetailPageLayout';
import { MetricChart } from './MetricChart';
import { StatCard } from './StatCard';
import './MetricChart.css';
import './TemperaturePage.css';

function TempStatsRow({
  current,
  min,
  max,
  avg,
}: {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
}): JSX.Element {
  const fmt = (v: number | null) => (v != null ? `${v}°C` : '—');

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

function sensorSubtitle(sensor: TempSensorStats): string | null {
  if (sensor.model && sensor.model !== sensor.name) {
    return `${sensor.model}${sensor.device ? ` · ${sensor.device}` : ''}`;
  }
  return sensor.device ?? null;
}

function tempHistoryHint(
  data: NonNullable<ReturnType<typeof useTemperatureAnalytics>['data']>,
  windowLabel: string,
): string {
  if (data.collecting) {
    return 'Collecting temperature history — one sample every 5 minutes.';
  }
  const span = formatDuration(data.historySpanMs);
  const count = `${data.sampleCount} sample${data.sampleCount === 1 ? '' : 's'} across ${data.sensors.length} sensor${data.sensors.length === 1 ? '' : 's'}`;
  if (data.historySpanMs < data.windowMs * 0.9) {
    return `${span} of data (${count}) — less than the ${windowLabel} window, so longer ranges may look identical for now.`;
  }
  return `${span} of data · ${count} · ${windowLabel} window`;
}

function groupSensors(
  sensors: TempSensorStats[],
): Array<{ role: TempSensorRole; items: TempSensorStats[] }> {
  const order: TempSensorRole[] = ['cpu', 'array', 'boot', 'drive'];
  const groups = new Map<TempSensorRole, TempSensorStats[]>();
  for (const sensor of sensors) {
    const list = groups.get(sensor.role) ?? [];
    list.push(sensor);
    groups.set(sensor.role, list);
  }
  return order
    .filter((role) => (groups.get(role)?.length ?? 0) > 0)
    .map((role) => ({ role, items: groups.get(role)! }));
}

function SensorHistoryBlock({
  sensor,
  windowLabel,
}: {
  sensor: TempSensorStats;
  windowLabel: string;
}): JSX.Element {
  const subtitle = sensorSubtitle(sensor);
  const samples = sensor.samples.map((s) => ({ t: s.t, v: s.c }));
  const range = sensor.min != null && sensor.max != null ? sensor.max - sensor.min : null;

  return (
    <article className={`temp-sensor-block temp-sensor-block--${sensor.severity}`}>
      <header className="temp-sensor-block-header">
        <div>
          <h4 className="temp-sensor-block-title">{sensor.name}</h4>
          {subtitle ? <p className="temp-sensor-block-subtitle">{subtitle}</p> : null}
        </div>
        <span className={`temp-chip temp-chip--${sensor.severity}`}>
          {sensor.severity === 'ok' ? 'OK' : sensor.severity === 'warn' ? 'Warm' : 'Hot'}
        </span>
      </header>
      <TempStatsRow current={sensor.current} min={sensor.min} max={sensor.max} avg={sensor.avg} />
      <MetricChart
        label={
          range != null && range < 4
            ? `${windowLabel} · zoomed (${range.toFixed(1)}°C range)`
            : windowLabel
        }
        samples={samples}
        warnAt={45}
        criticalAt={55}
        yDomain="auto"
        unit="°C"
      />
    </article>
  );
}

export function TemperaturePage(): JSX.Element {
  const [windowKey, setWindowKey] = useState<TempWindowKey>('24h');
  const { data, error, loading, refreshing, isStale, refresh } = useTemperatureAnalytics(windowKey);

  const windowLabel = TEMP_WINDOW_OPTIONS.find((o) => o.key === windowKey)?.label ?? windowKey;
  const ready = Boolean(data && data.window === windowKey);
  const groups = data ? groupSensors(data.sensors) : [];
  const hottest = data?.sensors[0] ?? null;

  return (
    <DetailPageLayout title="Temperature">
      <section className="detail-section">
        <h2 className="detail-section-title">History</h2>
        <div className="metrics-window-picker">
          {TEMP_WINDOW_OPTIONS.map(({ key, label }) => (
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
          label="Temperature history"
          error={error}
          loading={loading}
          ready={ready}
          isStale={isStale}
          onRetry={refresh}
          retrying={refreshing}
          unavailableMessage="Temperature charts are unavailable right now."
        >
          {data ? (
            <>
              <p className="metrics-history-hint">{tempHistoryHint(data, windowLabel)}</p>
              <p className="temp-page-note">
                Array slots use Unraid roles (Parity, Disk 1, Cache, …). SMART model names appear as
                subtitles when they differ.
              </p>

              <div className={refreshing ? 'metrics-history-loading' : undefined}>
                {hottest ? (
                  <div className="metric-history-block">
                    <h3 className="metric-history-block-title">Hottest now</h3>
                    <SensorHistoryBlock sensor={hottest} windowLabel={windowLabel} />
                  </div>
                ) : null}

                <section className="temp-role-section">
                  <h3 className="metric-history-block-title">{TEMP_ROLE_LABELS.cpu}</h3>
                  {!data.cpu.available ? (
                    <p className="temp-cpu-unavailable">{data.cpu.message}</p>
                  ) : null}
                </section>

                {groups
                  .filter((g) => g.role !== 'cpu')
                  .map(({ role, items }) => (
                    <section key={role} className="temp-role-section">
                      <h3 className="metric-history-block-title">{TEMP_ROLE_LABELS[role]}</h3>
                      {items.map((sensor) => (
                        <SensorHistoryBlock
                          key={sensor.id}
                          sensor={sensor}
                          windowLabel={windowLabel}
                        />
                      ))}
                    </section>
                  ))}

                {data.sensors.length === 0 ? (
                  <p className="temp-collecting-hint">
                    No temperature readings from Unraid right now.
                  </p>
                ) : null}
              </div>
            </>
          ) : null}
        </SectionFetchState>
      </section>

      {data && data.anomalies.length > 0 ? (
        <section className="detail-section">
          <h2 className="detail-section-title">Anomalies</h2>
          <div className="temp-anomaly-grid">
            {data.anomalies.map((a) => (
              <StatCard
                key={`${a.sensorId}-${a.kind}`}
                title={a.name}
                value={a.detail}
                severity={a.severity === 'critical' ? 'critical' : 'warn'}
              />
            ))}
          </div>
        </section>
      ) : null}
    </DetailPageLayout>
  );
}
