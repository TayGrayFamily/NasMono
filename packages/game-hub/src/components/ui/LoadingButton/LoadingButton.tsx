import React from 'react';
import './LoadingButton.css';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function LoadingButton({
  isLoading,
  children,
  disabled,
  className = '',
  ...props
}: LoadingButtonProps) {
  return (
    <button
      className={`loading-button ${isLoading ? 'is-loading' : ''} ${className}`.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      <span className="button-content">{children}</span>
      <div className="spinner-border" />
    </button>
  );
}
