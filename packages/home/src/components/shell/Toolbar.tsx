import type { JSX } from 'react';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import { NavDrawer } from './NavDrawer';
import './Shell.css';
import './NavDrawer.css';

export function Toolbar(): JSX.Element {
  return (
    <nav className="top-menu">
      <div className="top-menu-start">
        <NavDrawer />
        <div className="top-menu-brand">NAS MONO</div>
      </div>
      <div className="top-menu-spacer" />
      <div className="top-menu-actions">
        <a
          className="top-menu-button top-menu-link"
          href={UNRAID_DASHBOARD_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Unraid Dashboard
        </a>
      </div>
    </nav>
  );
}
