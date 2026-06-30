import type { JSX } from 'react';
import { severityFromPercent, type Severity } from '@/constants/statusThresholds';
import './DonutGauge.css';

export type DonutSegment = {
  value: number;
  color: string;
  label?: string;
};

export type DonutGaugeProps = {
  label: string;
  percent: number;
  severity?: Severity;
  segments?: DonutSegment[];
  size?: number;
};

function severityColor(severity: Severity): string {
  switch (severity) {
    case 'critical':
      return 'var(--status-red)';
    case 'warn':
      return 'var(--status-yellow)';
    default:
      return 'var(--status-green)';
  }
}

export function DonutGauge({
  label,
  percent,
  severity,
  segments,
  size = 88,
}: DonutGaugeProps): JSX.Element {
  const resolvedSeverity = severity ?? severityFromPercent(percent, { warn: 70, critical: 90 });
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let segmentEls: JSX.Element[];
  if (segments && segments.length > 0) {
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    let offset = 0;
    segmentEls = segments.map((seg, i) => {
      const len = total > 0 ? (seg.value / total) * circumference : 0;
      const el = (
        <circle
          key={seg.label ?? i}
          className="donut-gauge-ring"
          cx={center}
          cy={center}
          r={radius}
          stroke={seg.color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${len} ${circumference - len}`}
          strokeDashoffset={-offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      );
      offset += len;
      return el;
    });
  } else {
    const filled = (percent / 100) * circumference;
    segmentEls = [
      <circle
        key="fill"
        className="donut-gauge-ring"
        cx={center}
        cy={center}
        r={radius}
        stroke={severityColor(resolvedSeverity)}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={`${filled} ${circumference - filled}`}
        transform={`rotate(-90 ${center} ${center})`}
      />,
      <circle
        key="track"
        className="donut-gauge-track"
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={stroke}
        fill="none"
      />,
    ];
  }

  return (
    <div className="donut-gauge">
      <span className="donut-gauge-label">{label}</span>
      <div className="donut-gauge-chart" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
          <circle
            className="donut-gauge-track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={stroke}
            fill="none"
          />
          {segmentEls}
        </svg>
        <span
          className={`donut-gauge-value donut-gauge-value--${resolvedSeverity}`}
          style={{ color: severityColor(resolvedSeverity) }}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}
