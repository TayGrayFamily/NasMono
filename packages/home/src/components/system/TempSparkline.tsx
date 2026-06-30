import type { JSX } from 'react';
import type { TempSample } from '@/types/temperature';

type TempSparklineProps = {
  samples: TempSample[];
  width?: number;
  height?: number;
  warnAt?: number;
  criticalAt?: number;
};

export function TempSparkline({
  samples,
  width = 120,
  height = 32,
  warnAt = 45,
  criticalAt = 55,
}: TempSparklineProps): JSX.Element {
  if (samples.length < 2) {
    return (
      <svg
        width={width}
        height={height}
        className="temp-sparkline temp-sparkline--empty"
        aria-hidden
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="rgba(255,255,255,0.15)"
          strokeDasharray="3 3"
        />
      </svg>
    );
  }

  const temps = samples.map((s) => s.c);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = Math.max(maxT - minT, 4);
  const pad = range * 0.1;
  const yMin = minT - pad;
  const yMax = maxT + pad;
  const ySpan = yMax - yMin;

  const points = samples
    .map((s, i) => {
      const x = (i / (samples.length - 1)) * width;
      const y = height - ((s.c - yMin) / ySpan) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const last = temps[temps.length - 1]!;
  const stroke =
    last >= criticalAt
      ? 'var(--status-red)'
      : last >= warnAt
        ? 'var(--status-yellow)'
        : 'var(--status-green)';

  return (
    <svg width={width} height={height} className="temp-sparkline" aria-hidden>
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
}
