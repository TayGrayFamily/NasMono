import type { JSX } from 'react';
import type { Severity } from '@/constants/statusThresholds';
import type { AdminNotification } from '@/types/admin';
import { notificationSeverity, unraidNotificationUrl } from './alertUtils';
import './AlertsGroup.css';

type AlertItemProps = {
  title: string;
  subject: string;
  description: string;
  severity: Severity;
  time?: string | null;
  href?: string | null;
};

export function AlertItem({
  title,
  subject,
  description,
  severity,
  time,
  href,
}: AlertItemProps): JSX.Element {
  const body = (
    <>
      <header className="alert-item-header">
        <span className="alert-item-title">{title}</span>
        <span className={`alert-item-dot alert-item-dot--${severity}`} aria-hidden />
      </header>
      <div className="alert-item-subject" title={subject}>
        {subject}
      </div>
      <div className="alert-item-description" title={description}>
        {description}
      </div>
      {time ? (
        <div className="alert-item-time" title={time}>
          {time}
        </div>
      ) : null}
    </>
  );

  if (href) {
    return (
      <a
        className={`alert-item alert-item--${severity} alert-item--link`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {body}
      </a>
    );
  }

  return <article className={`alert-item alert-item--${severity}`}>{body}</article>;
}

type AlertsGroupPanelProps = {
  severity: Severity;
  items: AdminNotification[];
  apiWarnings: string[];
  archived: number;
};

export function AlertsGroupPanel({
  severity,
  items,
  apiWarnings,
  archived,
}: AlertsGroupPanelProps): JSX.Element {
  const issueCount = items.length + apiWarnings.length;

  return (
    <section
      className={`group-panel group-panel--alerts${issueCount === 0 ? ' group-panel--alerts-empty' : ''}`}
      aria-label="Alerts"
    >
      <header className="group-panel-header">
        <div className="group-panel-heading">
          <span className={`group-panel-dot group-panel-dot--${severity}`} aria-hidden />
          <h2 className="group-panel-title">Alerts</h2>
        </div>
        {issueCount > 0 ? (
          <span className={`group-panel-badge group-panel-badge--${severity}`}>
            {issueCount} unread
          </span>
        ) : null}
      </header>
      <div className="alerts-group-body">
        {items.length === 0 && apiWarnings.length === 0 ? (
          <p className="alerts-empty">No unread notifications</p>
        ) : null}
        {items.map((n) => (
          <AlertItem
            key={n.id}
            title={n.title}
            subject={n.subject}
            description={n.description}
            severity={notificationSeverity(n.importance)}
            time={n.formattedTimestamp ?? n.timestamp}
            href={unraidNotificationUrl(n.link)}
          />
        ))}
        {apiWarnings.map((w) => (
          <AlertItem
            key={w}
            title="API"
            subject="GraphQL warning"
            description={w}
            severity="warn"
          />
        ))}
        {archived > 0 ? (
          <p className="alerts-archived-hint">{archived} archived in Unraid</p>
        ) : null}
      </div>
    </section>
  );
}
