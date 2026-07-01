import React from 'react';
import './LobbyCard.css';

export interface LobbyCardData {
  id: string;
  name: string;
  hostName?: string;
  playerCount: number;
}

interface LobbyCardProps {
  lobby: LobbyCardData;
  onJoin: (id: string) => void;
  disabled?: boolean;
}

export function LobbyCard({ lobby, onJoin, disabled }: LobbyCardProps) {
  const count = Number(lobby.playerCount) || 0;

  return (
    <button
      type="button"
      className="lobby-card"
      onClick={() => onJoin(lobby.id)}
      disabled={disabled}
    >
      <div className="lobby-card__name">{lobby.name}</div>
      <div className="lobby-card__meta">
        {lobby.hostName && (
          <div className="lobby-card__leader">
            <span className="lobby-card__leader-dot" aria-hidden />
            <span>Leader: {lobby.hostName}</span>
          </div>
        )}
        <div className="lobby-card__players">
          <span className="lobby-card__players-dot" aria-hidden />
          <span>
            {count} {count === 1 ? 'player' : 'players'}
          </span>
        </div>
      </div>
    </button>
  );
}

export function LobbyGrid({ children }: { children: React.ReactNode }) {
  return <div className="lobby-grid">{children}</div>;
}
