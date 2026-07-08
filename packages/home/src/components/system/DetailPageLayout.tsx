import { Button } from '@chakra-ui/react';
import { Link } from '@tanstack/react-router';
import type { JSX, ReactNode } from 'react';
import { UNRAID_DASHBOARD_URL } from '@/constants/unraidLinks';
import { FetchStatusBanner } from '@/components/shared/FetchStatusBanner';
import { ModuleLoadError } from '@/components/shared/FetchStatusBanner';
import { useSystemContext } from './SystemProvider';
import '../shell/Shell.css';
import './DetailPage.css';

type DetailPageLayoutProps = {
  title: string;
  children: ReactNode;
};

export function DetailPageLayout({ title, children }: DetailPageLayoutProps): JSX.Element {
  const { data, error, loading, refreshing, isStale, refresh } = useSystemContext();

  let body: ReactNode;
  if (error && !data) {
    body = (
      <ModuleLoadError
        title="Could not load system overview"
        error={error}
        onRetry={refresh}
        retrying={loading}
      />
    );
  } else if (!data) {
    body = (
      <div className="system-page-loading">
        <div className="loading-spinner" />
      </div>
    );
  } else {
    body = (
      <>
        {isStale ? (
          <FetchStatusBanner
            message="System overview refresh failed"
            detail={`${error} — showing last successful data.`}
            onRetry={refresh}
            retrying={refreshing}
          />
        ) : null}
        {children}
      </>
    );
  }

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
          <Button
            size="sm"
            variant="outline"
            onClick={() => void refresh()}
            loading={refreshing}
            disabled={!data && loading}
          >
            Refresh
          </Button>
        </div>
      </header>
      <div className="detail-page-body">{body}</div>
    </main>
  );
}
