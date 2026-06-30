import { useState, type JSX, type ReactNode } from 'react';
import './CollapsibleSection.css';

type CollapsibleSectionProps = {
  title: string;
  count: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsibleSection({
  title,
  count,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="system-section collapsible-section">
      <button
        type="button"
        className="collapsible-section-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span
          className={`collapsible-chevron${open ? ' collapsible-chevron--open' : ''}`}
          aria-hidden
        >
          ›
        </span>
        <span className="collapsible-section-title">{title}</span>
        <span className="collapsible-section-count">{count}</span>
      </button>
      {open ? <div className="collapsible-section-body">{children}</div> : null}
    </section>
  );
}
