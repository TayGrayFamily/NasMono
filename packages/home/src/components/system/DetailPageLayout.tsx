import { Button } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import type { JSX, ReactNode } from 'react';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import { useSystemContext } from './SystemProvider';
import '../shell/Shell.css';
import './DetailPage.css';

type DetailPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function DetailPageLayout({ title, children }: DetailPageLayoutProps): JSX.Element {
  const { loading, refresh } = useSystemContext();

  return (
    <main className="detail-page-wrap">
      <header className="detail-page-header">
        <div className="detail-page-nav">
          <Link to="/system" className="detail-page-back">
            ← Control panel
          </Link>
          <h1 className="detail-page-title">{title}</h1>
        </div>
        <div className="detail-page-actions">
          <a
            className="launch-button"
            href={UNRAID_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            Unraid
          </a>
          <Button size="sm" variant="outline" onClick={() => void refresh()} loading={loading}>
            Refresh
          </Button>
        </div>
      </header>
      <div className="detail-page-body">{children}</div>
    </main>
  );
}
