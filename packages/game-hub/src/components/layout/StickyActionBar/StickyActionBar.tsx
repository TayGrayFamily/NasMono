import React from 'react';
import './StickyActionBar.css';

interface StickyActionBarProps {
  children: React.ReactNode;
}

export function StickyActionBar({ children }: StickyActionBarProps) {
  return (
    <footer className="sticky-action-bar">
      <div className="sticky-action-bar__inner">{children}</div>
    </footer>
  );
}
