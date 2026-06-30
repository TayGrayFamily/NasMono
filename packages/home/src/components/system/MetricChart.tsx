import type { JSX } from 'react';
import type { MetricSample } from '@/types/metrics';
import './MetricChart.css';

type MetricChartProps = {
  samples: MetricSample[];
  warnAt?: number;
  criticalAt?: number;
  label?: string;
  /** Pin Y axis to 0–100% or zoom to sample range (helps flat lines). */
  yDomain?: 'percent' | 'auto';
  unit?: string;
};

export function MetricChart({
  samples,
  warnAt = 70,
  criticalAt = 90,
  label,
  yDomain = 'percent',
  unit = '',
}: MetricChartProps): JSX.Element {
  const width = 800;
  const height = 140;
  const padLeft = 36;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 24;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  if (samples.length < 2) {
    return (
      <div className="metric-chart metric-chart--empty">
        {label ? <div className="metric-chart-label">{label}</div> : null}
        <p className="metric-chart-hint">Collecting history — check back after a few samples.</p>
      </div>
    );
  }

  const values = samples.map((s) => s.v);
  const last = values[values.length - 1]!;

  let yMin = 0;
  let yMax = 100;

  if (yDomain === 'auto') {
    const vmin = Math.min(...values);
    const vmax = Math.max(...values);
    const span = vmax - vmin;
    const padding = Math.max(span * 0.25, 0.5);
    yMin = Math.max(0, Math.floor((vmin - padding) * 10) / 10);
    yMax = Math.min(100, Math.ceil((vmax + padding) * 10) / 10);
    if (yMax - yMin < 2) {
      const mid = (vmin + vmax) / 2;
      yMin = Math.max(0, Math.floor((mid - 1) * 10) / 10);
      yMax = Math.min(100, Math.ceil((mid + 1) * 10) / 10);
    }
  }

  const yTicks =
    yDomain === 'auto' && yMax - yMin <= 10
      ? Array.from({ length: Math.min(5, Math.round((yMax - yMin) * 2) + 1) }, (_, i) => {
          const step = (yMax - yMin) / Math.max(1, Math.min(4, Math.round((yMax - yMin) * 2)));
          return Math.round((yMin + step * i) * 10) / 10;
        })
      : [0, 25, 50, 75, 100];

  const stroke =
    last >= criticalAt
      ? 'var(--status-red)'
      : last >= warnAt
        ? 'var(--status-yellow)'
        : 'var(--status-green)';

  const toX = (i: number) => padLeft + (i / (samples.length - 1)) * chartW;
  const toY = (v: number) => padTop + chartH - ((v - yMin) / (yMax - yMin)) * chartH;

  const points = samples.map((s, i) => `${toX(i)},${toY(s.v)}`).join(' ');

  const warnY = toY(warnAt);
  const critY = toY(criticalAt);

  return (
    <div className="metric-chart">
      {label ? <div className="metric-chart-label">{label}</div> : null}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="metric-chart-svg"
        preserveAspectRatio="none"
        role="img"
        aria-label={label ? `${label} over time` : 'Metric over time'}
      >
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={padLeft}
              y1={toY(tick)}
              x2={width - padRight}
              y2={toY(tick)}
              className="metric-chart-grid"
            />
            <text x={padLeft - 6} y={toY(tick) + 4} className="metric-chart-tick" textAnchor="end">
              {tick}
              {unit ? ` ${unit}` : ''}
            </text>
          </g>
        ))}
        <line
          x1={padLeft}
          y1={warnY}
          x2={width - padRight}
          y2={warnY}
          className="metric-chart-threshold metric-chart-threshold--warn"
        />
        <line
          x1={padLeft}
          y1={critY}
          x2={width - padRight}
          y2={critY}
          className="metric-chart-threshold metric-chart-threshold--critical"
        />
        <polyline
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
        />
      </svg>
    </div>
  );
}
