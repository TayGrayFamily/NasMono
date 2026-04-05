import type { JSX } from 'react';
import './Shell.css';

export function Toolbar(): JSX.Element {
  return (
    <nav className="top-menu">
      <div className="top-menu-brand">NAS MONO</div>
      <div className="top-menu-spacer" />
      <div className="top-menu-actions">
        <button className="top-menu-button" type="button">
          Status: Online
        </button>
      </div>
    </nav>
  );
}
