import React, { useState, useRef, useEffect } from 'react';
import './PlayerRow.css';

export interface PlayerRowPlayer {
  id: string;
  name: string;
  connected?: boolean;
}

interface PlayerRowProps {
  player: PlayerRowPlayer;
  isYou: boolean;
  isHost: boolean;
  showHostMenu?: boolean;
  onTransferHost?: () => void;
  onRemovePlayer?: () => void;
  isTransferring?: boolean;
  isRemoving?: boolean;
}

export function PlayerRow({
  player,
  isYou,
  isHost,
  showHostMenu,
  onTransferHost,
  onRemovePlayer,
  isTransferring,
  isRemoving,
}: PlayerRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const connected = player.connected ?? false;

  return (
    <div className={`player-row ${!connected ? 'player-row--disconnected' : ''}`}>
      <div className="player-row__main">
        <div className="player-row__avatar-wrap">
          <div className="player-row__avatar">{player.name.charAt(0).toUpperCase()}</div>
          <span
            className={`player-row__presence player-row__presence--${connected ? 'connected' : 'disconnected'}`}
            title={connected ? 'Connected' : 'Disconnected'}
          />
        </div>
        <div className="player-row__info">
          <span className="player-row__name">
            {player.name}
            {isYou ? ' (You)' : ''}
          </span>
          {isHost && <span className="player-row__host">👑 HOST</span>}
          {!connected && <span className="player-row__status">Disconnected</span>}
        </div>
      </div>

      {showHostMenu && (onTransferHost || onRemovePlayer) && (
        <div className="player-row__menu-wrap" ref={menuRef}>
          <button
            type="button"
            className="secondary player-row__menu-trigger"
            aria-haspopup="true"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
            disabled={isTransferring || isRemoving}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="player-row__menu" role="menu">
              {onTransferHost && (
                <button
                  type="button"
                  className="player-row__menu-item"
                  role="menuitem"
                  disabled={isTransferring || isRemoving}
                  onClick={() => {
                    setMenuOpen(false);
                    onTransferHost();
                  }}
                >
                  {isTransferring ? 'Transferring…' : 'Make host'}
                </button>
              )}
              {onRemovePlayer && (
                <button
                  type="button"
                  className="player-row__menu-item"
                  role="menuitem"
                  disabled={isTransferring || isRemoving}
                  onClick={() => {
                    setMenuOpen(false);
                    onRemovePlayer();
                  }}
                >
                  {isRemoving ? 'Removing…' : 'Remove player'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PlayersGrid({ children }: { children: React.ReactNode }) {
  return <div className="players-grid">{children}</div>;
}
