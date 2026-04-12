import React from 'react';
import './Header.css';

interface HeaderProps {
  title: string;
  subtitle: string;
  currentUser: { name: string } | null;
  isConnected: boolean;
  socketId?: string;
}

export function Header({ title, subtitle, currentUser, isConnected, socketId }: HeaderProps) {
  return (
    <header className="game-header">
      <div className="header-content">
        <h1 className="header-title">{title}</h1>
        <p className="header-subtitle">{subtitle}</p>
      </div>
      <div className="header-status">
        <div className="user-info">
          <div className={`status-dot ${isConnected ? 'online' : 'offline'}`} />
          {currentUser && <span className="user-name">{currentUser.name}</span>}
        </div>
        <span className="separator">|</span>
        <span className={`status-text ${isConnected ? 'online' : 'offline'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>{' '}
    </header>
  );
}
