import type { JSX } from 'react';
import type { HealthReport } from './systemHealth';
import './HealthBanner.css';

type HealthBannerProps = {
  hostname: string;
  report: HealthReport;
};

export function HealthBanner({ hostname, report }: HealthBannerProps): JSX.Element {
  const { overall, attention, summary } = report;
  const issueCount = attention.length;

  let headline: string;
  let subline: string;

  if (issueCount === 0) {
    headline = 'All systems healthy';
    subline = `${summary.ok} checks passed on ${hostname}`;
  } else if (summary.critical > 0) {
    headline = `${summary.critical} critical · ${summary.warn} warning${summary.warn === 1 ? '' : 's'}`;
    subline = `${issueCount} item${issueCount === 1 ? '' : 's'} need attention on ${hostname}`;
  } else {
    headline = `${issueCount} warning${issueCount === 1 ? '' : 's'}`;
    subline = `Review items below on ${hostname}`;
  }

  return (
    <div className={`health-banner health-banner--${overall}`}>
      <div className="health-banner-main">
        <span className={`health-banner-dot health-banner-dot--${overall}`} aria-hidden />
        <div>
          <h2 className="health-banner-headline">{headline}</h2>
          <p className="health-banner-subline">{subline}</p>
        </div>
      </div>
    </div>
  );
}
