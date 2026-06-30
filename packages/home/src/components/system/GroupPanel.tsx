import { Link } from '@tanstack/react-router';
import type { JSX } from 'react';
import type { Severity } from '@/constants/statusThresholds';
import type { PanelCard as PanelCardType } from './controlPanelHealth';
import './ControlPanel.css';

type PanelCardProps = {
  card: PanelCardType;
};

export function PanelCard({ card }: PanelCardProps): JSX.Element {
  return (
    <Link to={card.to} className={`panel-card panel-card--${card.severity}`}>
      <header className="panel-card-header">
        <h3 className="panel-card-title">{card.title}</h3>
        <span className={`panel-card-dot panel-card-dot--${card.severity}`} aria-hidden />
      </header>
      <div className="panel-card-summary">{card.summary}</div>
      {card.detail ? <div className="panel-card-detail">{card.detail}</div> : null}
    </Link>
  );
}

type GroupPanelProps = {
  groupId: string;
  title: string;
  severity: Severity;
  cards: PanelCardType[];
  layout?: 'stack' | 'metrics';
};

export function GroupPanel({
  groupId,
  title,
  severity,
  cards,
  layout = 'stack',
}: GroupPanelProps): JSX.Element {
  const issueCount = cards.filter((c) => c.severity !== 'ok').length;
  const bodyClass =
    layout === 'metrics'
      ? `group-panel-body group-panel-body--metrics group-panel-body--cards-${cards.length}`
      : `group-panel-body group-panel-body--cards-${cards.length}`;

  return (
    <section className={`group-panel group-panel--${groupId}`} aria-label={title}>
      <header className="group-panel-header">
        <div className="group-panel-heading">
          <span className={`group-panel-dot group-panel-dot--${severity}`} aria-hidden />
          <h2 className="group-panel-title">{title}</h2>
        </div>
        {issueCount > 0 ? (
          <span className={`group-panel-badge group-panel-badge--${severity}`}>
            {issueCount} issue{issueCount === 1 ? '' : 's'}
          </span>
        ) : null}
      </header>
      <div className={bodyClass}>
        {cards.map((card) => (
          <PanelCard key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}
