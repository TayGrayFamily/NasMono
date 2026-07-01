import React from 'react';
import './StatusStrip.css';

type StatusStripVariant = 'waiting' | 'info';

interface StatusStripProps {
  variant?: StatusStripVariant;
  title: string;
  helper?: string;
}

export function StatusStrip({ variant = 'info', title, helper }: StatusStripProps) {
  return (
    <div className={`status-strip status-strip--${variant}`}>
      <p className="status-strip__title">{title}</p>
      {helper && <p className="status-strip__helper">{helper}</p>}
    </div>
  );
}
