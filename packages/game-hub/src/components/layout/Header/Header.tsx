import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentUser: { name: string } | null;
  isConnected: boolean;
  socketId?: string;
  onSignOut?: () => void;
  onManageUser?: () => void;
}

export function Header({
  title,
  subtitle,
  currentUser,
  isConnected,
  onSignOut,
  onManageUser,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="game-header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>

      <div className="header-actions">
        <div className="header-status">
          <div className="user-info">
            <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
            <span className={`status-text ${isConnected ? 'online' : 'offline'}`}>
              {isConnected ? 'Connected' : 'Offline'}
            </span>
          </div>
        </div>

        {currentUser && (
          <div className="user-menu-container" ref={menuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-haspopup="true"
              aria-expanded={isMenuOpen}
            >
              <div className="avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
              <span className="user-name">{currentUser.name}</span>
              <span className={`chevron ${isMenuOpen ? 'open' : ''}`}>▾</span>
            </button>

            {isMenuOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <strong>{currentUser.name}</strong>
                  <span className="text-muted">Player</span>
                </div>
                <div className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onManageUser?.();
                  }}
                >
                  <span className="icon">👤</span> Manage Profile
                </button>
                <button
                  className="dropdown-item logout"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onSignOut?.();
                  }}
                >
                  <span className="icon">🚀</span> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
