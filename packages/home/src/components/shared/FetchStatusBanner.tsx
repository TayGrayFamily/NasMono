import { Button } from '@chakra-ui/react';
import type { JSX } from 'react';
import './FetchStatus.css';

type FetchStatusBannerProps = {
  message: string;
  detail?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export function FetchStatusBanner({
  message,
  detail,
  onRetry,
  retrying,
}: FetchStatusBannerProps): JSX.Element {
  return (
    <div className="fetch-status-banner" role="status">
      <div className="fetch-status-banner-text">
        <strong>{message}</strong>
        {detail ? <span className="fetch-status-banner-detail">{detail}</span> : null}
      </div>
      {onRetry ? (
        <Button size="xs" variant="outline" onClick={() => void onRetry()} loading={retrying}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}

type ModuleLoadErrorProps = {
  title?: string;
  error: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export function ModuleLoadError({
  title = 'Could not load this section',
  error,
  onRetry,
  retrying,
}: ModuleLoadErrorProps): JSX.Element {
  return (
    <div className="module-load-error">
      <h2 className="module-load-error-title">{title}</h2>
      <p className="module-load-error-message">{error}</p>
      {onRetry ? (
        <Button size="sm" variant="outline" onClick={() => void onRetry()} loading={retrying}>
          Retry
        </Button>
      ) : null}
    </div>
  );
}
