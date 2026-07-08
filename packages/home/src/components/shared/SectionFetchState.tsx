import type { JSX, ReactNode } from 'react';
import { FetchStatusBanner } from './FetchStatusBanner';
import './FetchStatus.css';

type SectionFetchStateProps = {
  label: string;
  error: string | null;
  loading: boolean;
  ready: boolean;
  isStale?: boolean;
  onRetry?: () => void;
  retrying?: boolean;
  unavailableMessage?: string;
  children: ReactNode;
};

export function SectionFetchState({
  label,
  error,
  loading,
  ready,
  isStale,
  onRetry,
  retrying,
  unavailableMessage,
  children,
}: SectionFetchStateProps): JSX.Element {
  return (
    <div className="section-fetch-state">
      {error ? (
        <FetchStatusBanner
          message={isStale ? `${label} refresh failed` : `${label} unavailable`}
          detail={isStale ? `${error} — showing last data where possible.` : error}
          onRetry={onRetry}
          retrying={retrying}
        />
      ) : null}
      {loading && !ready ? (
        <div className="section-fetch-loading">
          <div className="loading-spinner" />
        </div>
      ) : null}
      {ready ? children : null}
      {!ready && !loading && error && unavailableMessage ? (
        <p className="system-page-subtitle">{unavailableMessage}</p>
      ) : null}
    </div>
  );
}
