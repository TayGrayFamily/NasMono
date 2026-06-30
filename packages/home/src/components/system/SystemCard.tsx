import type { JSX } from 'react';
import type { AdminOverview } from '@/types/admin';
import { formatBytes } from './formatUtils';
import { DonutGauge } from './DonutGauge';
import './SystemCard.css';

const LEGEND_SYSTEM = '#94a3b8';
const LEGEND_DOCKER = '#ffb74d';
const LEGEND_FREE = 'rgba(255, 255, 255, 0.2)';

type SystemCardProps = {
  card: AdminOverview['systemCard'];
  cpuBrand: string;
};

export function SystemCard({ card, cpuBrand }: SystemCardProps): JSX.Element {
  const { memoryLegend } = card;
  const memGiB = formatBytes(memoryLegend.usableBytes);
  const maxGiB = formatBytes(memoryLegend.maxBytes);

  const ramSegments = [
    { value: memoryLegend.systemBytes, color: LEGEND_SYSTEM, label: 'System' },
    { value: memoryLegend.dockerBytes, color: LEGEND_DOCKER, label: 'Docker' },
    { value: memoryLegend.freeBytes, color: LEGEND_FREE, label: 'Free' },
  ].filter((s) => s.value > 0);

  const gauges = [
    {
      key: 'ram',
      label: 'RAM usage',
      percent: card.memoryPercent,
      segments: ramSegments,
    },
    {
      key: 'flash',
      label: card.flash.label,
      percent: card.flash.percent,
    },
    ...(card.logFilesystem
      ? [{ key: 'log', label: 'Log filesystem', percent: card.logFilesystem.percent }]
      : []),
    ...(card.dockerVdisk
      ? [{ key: 'docker-vdisk', label: 'Docker vdisk', percent: card.dockerVdisk.percent }]
      : []),
  ];

  return (
    <section className="unraid-system-card">
      <header className="unraid-system-card-header">
        <div className="unraid-system-card-title-row">
          <span className="unraid-system-card-icon" aria-hidden>
            ⬡
          </span>
          <h2 className="unraid-system-card-title">System</h2>
        </div>
        <p className="unraid-system-card-memory-line">
          Memory: {memGiB} {memoryLegend.memoryType}
        </p>
        <p className="unraid-system-card-cpu-line">{cpuBrand}</p>
      </header>

      <div className="unraid-system-card-body">
        <div className="unraid-system-card-stats">
          <dl className="unraid-system-card-dl">
            <div>
              <dt>Usable size</dt>
              <dd>{memGiB}</dd>
            </div>
            <div>
              <dt>Maximum size</dt>
              <dd>{maxGiB}</dd>
            </div>
          </dl>

          <div className="unraid-system-card-legend">
            <p className="unraid-system-card-legend-title">Legend</p>
            <ul>
              <li>
                <span className="legend-dot" style={{ background: LEGEND_SYSTEM }} />
                System <span>{formatBytes(memoryLegend.systemBytes)}</span>
              </li>
              {memoryLegend.dockerBytes > 0 ? (
                <li>
                  <span className="legend-dot" style={{ background: LEGEND_DOCKER }} />
                  Docker <span>{formatBytes(memoryLegend.dockerBytes)}</span>
                </li>
              ) : (
                <li className="unraid-system-card-legend-note">
                  Docker RAM split not exposed in Unraid API 7.2
                </li>
              )}
              <li>
                <span className="legend-dot" style={{ background: LEGEND_FREE }} />
                Free <span>{formatBytes(memoryLegend.freeBytes)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="unraid-system-card-gauges">
          {gauges.map((g) => (
            <DonutGauge
              key={g.key}
              label={g.label}
              percent={g.percent}
              segments={'segments' in g ? g.segments : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
