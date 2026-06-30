import type { JSX, ReactNode } from 'react';
import type { Severity } from '@/constants/statusThresholds';
import './SystemPage.css';

export type StatCardProps = {
  title: string;
  value: ReactNode;
  detail?: ReactNode;
  severity?: Severity;
  footer?: ReactNode;
  className?: string;
};

export function StatCard({
  title,
  value,
  detail,
  severity = 'ok',
  footer,
  className,
}: StatCardProps): JSX.Element {
  return (
    <article className={`stat-card stat-card--${severity} ${className ?? ''}`.trim()}>
      <header className="stat-card-header">
        <h3 className="stat-card-title" title={title}>
          {title}
        </h3>
        <span className={`stat-card-dot stat-card-dot--${severity}`} aria-hidden />
      </header>
      <div className="stat-card-value">{value}</div>
      {detail ? <div className="stat-card-detail">{detail}</div> : null}
      {footer ? <div className="stat-card-footer">{footer}</div> : null}
    </article>
  );
}

export type ProgressBarProps = {
  percent: number;
  severity: Severity;
  label?: string;
};

export function ProgressBar({ percent, severity, label }: ProgressBarProps): JSX.Element {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="stat-progress">
      {label ? (
        <div className="stat-progress-label">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      ) : null}
      <div className="stat-progress-track">
        <div
          className={`stat-progress-fill stat-progress-fill--${severity}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
