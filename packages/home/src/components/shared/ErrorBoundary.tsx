import { Component, type ErrorInfo, type JSX, type ReactNode } from 'react';
import { Button } from '@chakra-ui/react';
import './FetchStatus.css';

type ErrorBoundaryProps = {
  children: ReactNode;
  title?: string;
};

type ErrorBoundaryState = {
  error: Error | null;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ error: null });
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="module-load-error">
          <h2 className="module-load-error-title">
            {this.props.title ?? 'Something went wrong in this view'}
          </h2>
          <p className="module-load-error-message">{this.state.error.message}</p>
          <Button size="sm" variant="outline" onClick={this.handleRetry}>
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function RouteErrorBoundary({ children }: { children: ReactNode }): JSX.Element {
  return <ErrorBoundary title="This page hit an unexpected error">{children}</ErrorBoundary>;
}
