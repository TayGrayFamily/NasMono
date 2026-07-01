import React from 'react';
import './Page.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backLabel?: string;
  onBack?: () => void;
}

export function PageHeader({ title, subtitle, backLabel, onBack }: PageHeaderProps) {
  return (
    <header className="page-header">
      {onBack && backLabel && (
        <button type="button" className="ghost page-header__back" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <div>
        <h2 className="page-header__title">{title}</h2>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
    </header>
  );
}

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

export function Page({ children, className = '' }: PageProps) {
  return <div className={`page ${className}`.trim()}>{children}</div>;
}
