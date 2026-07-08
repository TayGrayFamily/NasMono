import type { JSX } from 'react';
import { severityFromPercent, sharePercentFull } from '@/constants/statusThresholds';
import {
  arrayDiskSeverity,
  bootDiskSeverity,
  pctThresholds,
  physicalDiskSeverity,
} from './healthChecks';
import { formatKilobytes } from './formatUtils';
import { DetailPageLayout } from './DetailPageLayout';
import { ProgressBar, StatCard } from './StatCard';
import { useSystemContext } from './SystemProvider';
import './SystemPage.css';

export function StoragePage(): JSX.Element {
  const { data } = useSystemContext();

  if (!data) {
    return <DetailPageLayout title="Storage">{null}</DetailPageLayout>;
  }

  const limits = pctThresholds(data);
  const boot = data.array.boot;
  const bootPct =
    boot.fsSize != null && boot.fsSize > 0 && boot.fsUsed != null
      ? Math.round((boot.fsUsed / boot.fsSize) * 100)
      : 0;

  return (
    <DetailPageLayout title="Storage">
      <section className="detail-section">
        <h2 className="detail-section-title">Array</h2>
        <div className="detail-scroll-grid">
          <StatCard
            title="Array state"
            value={data.array.state}
            detail={`Parity ${data.array.parityStatus}${data.array.parityProgress > 0 ? ` · ${data.array.parityProgress}%` : ''}`}
            severity={data.array.state === 'STARTED' ? 'ok' : 'critical'}
          />
          <StatCard
            title={`Boot (${boot.name})`}
            value={boot.temp != null ? `${boot.temp}°C` : boot.status}
            detail={`${bootPct}% used`}
            severity={bootDiskSeverity(boot)}
          />
          {data.array.disks.map((disk) => (
            <StatCard
              key={disk.name}
              title={disk.name}
              value={disk.temp != null ? `${disk.temp}°C` : disk.status}
              detail={
                disk.fsSize != null && disk.fsFree != null
                  ? `${formatKilobytes(disk.fsSize - disk.fsFree)} / ${formatKilobytes(disk.fsSize)}`
                  : disk.status
              }
              severity={arrayDiskSeverity(disk)}
            />
          ))}
          {data.physicalDisks.map((disk) => (
            <StatCard
              key={disk.device ?? disk.name}
              title={disk.name}
              value={disk.temperature != null ? `${disk.temperature}°C` : (disk.smartStatus ?? '—')}
              detail={disk.device ?? undefined}
              severity={physicalDiskSeverity(disk)}
            />
          ))}
        </div>
      </section>

      <section id="shares" className="detail-section">
        <h2 className="detail-section-title">Shares</h2>
        <div className="detail-scroll-grid">
          {data.shares.map((share) => {
            const pct = sharePercentFull(share.used, share.free);
            const severity = severityFromPercent(pct, limits);
            return (
              <StatCard
                key={share.name}
                title={share.name}
                value={`${pct}% full`}
                severity={severity}
                footer={<ProgressBar percent={pct} severity={severity} />}
              />
            );
          })}
        </div>
      </section>
    </DetailPageLayout>
  );
}
