import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { LoadingButton } from './ui/LoadingButton';
import { useScreenMode } from '../hooks/useScreenMode';
import { apiFetch } from '../lib/api';

interface Player {
  id: string;
  name: string;
}

interface LobbyDetailData {
  id: string;
  name?: string;
  hostId: string;
  created_at: string;
  players: Player[];
}

interface LobbyDetailProps {
  lobbyId: string;
  currentUserId: string;
  onBack: () => void;
}

function LobbyDetail({ lobbyId, currentUserId, onBack }: LobbyDetailProps) {
  const socket = useSocket();
  const [lobby, setLobby] = useState<LobbyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isTransferring, setIsTransferring] = useState<string | null>(null);
  const mode = useScreenMode();

  useEffect(() => {
    let mounted = true;

    const fetchLobbyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/lobbies/${lobbyId}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Failed to fetch lobby: ${text || response.statusText}`);
        }
        const data: LobbyDetailData = await response.json();
        if (mounted) setLobby(data);
      } catch (err: unknown) {
        if (mounted) setError(err instanceof Error ? err.message : String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLobbyDetails();

    const handlePlayerJoined = (data: { userId: string; name: string }) => {
      setLobby((current) => {
        if (!current || current.players.some((p) => p.id === data.userId)) return current;
        return { ...current, players: [...current.players, { id: data.userId, name: data.name }] };
      });
    };

    const handlePlayerLeft = (data: { userId: string }) => {
      setLobby((current) => {
        if (!current) return null;
        return { ...current, players: current.players.filter((p) => p.id !== data.userId) };
      });
    };

    const handleHostTransferred = (data: { newHostId: string }) => {
      setLobby((current) => {
        if (!current) return null;
        return { ...current, hostId: data.newHostId };
      });
    };

    if (socket) {
      socket.emit('join_lobby_room', { lobbyId, userId: currentUserId });
      socket.on('player_joined', handlePlayerJoined);
      socket.on('player_left', handlePlayerLeft);
      socket.on('host_transferred', handleHostTransferred);

      return () => {
        mounted = false;
        socket.off('player_joined', handlePlayerJoined);
        socket.off('player_left', handlePlayerLeft);
        socket.off('host_transferred', handleHostTransferred);
      };
    }
  }, [lobbyId, socket, currentUserId]);

  const handleJoinLobby = async () => {
    setIsJoining(true);
    try {
      const response = await apiFetch(
        `/api/lobbies/${lobbyId}/join`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId }),
        },
        socket?.id,
      );

      if (!response.ok) throw new Error('Failed to join lobby');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleTransferHost = async (newHostId: string) => {
    if (!confirm('Transfer lobby ownership to this player?')) return;

    setIsTransferring(newHostId);
    try {
      const response = await apiFetch(
        `/api/lobbies/${lobbyId}/transfer-host`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newHostId, currentUserId }),
        },
        socket?.id,
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to transfer host');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsTransferring(null);
    }
  };

  const isPlayerInLobby = lobby?.players.some((p) => p.id === currentUserId) || false;

  const handleBack = async () => {
    if (isPlayerInLobby) {
      try {
        await apiFetch(
          `/api/lobbies/${lobbyId}/leave`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: currentUserId }),
          },
          socket?.id,
        );
      } catch (err) {
        console.error('Error leaving lobby:', err);
      }
    }
    onBack();
  };

  if (loading) return <div className="panel">Loading lobby details...</div>;
  if (error)
    return (
      <div className="panel" style={{ textAlign: 'center' }}>
        <h2 style={{ color: 'var(--error-color)' }}>Error</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {error}
        </p>
        <button onClick={onBack}>Back to Lobbies</button>
      </div>
    );
  if (!lobby) return <div className="panel">Lobby not found.</div>;

  const isHost = currentUserId === lobby.hostId;

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          className="ghost"
          onClick={handleBack}
          style={{ alignSelf: 'flex-start', marginLeft: '-0.5rem' }}
        >
          ← Back to Lobbies
        </button>
        <div>
          <h2>{lobby.name || 'Game Lobby'}</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
            Lobby ID: {lobby.id}
          </p>
        </div>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3
          style={{
            fontSize: '1.125rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Players
          <span className="status-badge online" style={{ fontSize: '0.7rem' }}>
            {lobby.players.length} Online
          </span>
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              mode === 'mobile' ? '1fr' : 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {lobby.players.map((p) => (
            <div
              key={p.id}
              style={{
                padding: '1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary-cyan)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                  }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 500 }}>
                    {p.name} {p.id === currentUserId && '(You)'}
                  </span>
                  {p.id === lobby.hostId && (
                    <span
                      style={{ fontSize: '0.7rem', color: 'var(--primary-cyan)', fontWeight: 700 }}
                    >
                      👑 HOST
                    </span>
                  )}
                </div>
              </div>

              {isHost && p.id !== currentUserId && (
                <button
                  className="secondary"
                  style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                  onClick={() => handleTransferHost(p.id)}
                  disabled={isTransferring !== null}
                >
                  {isTransferring === p.id ? '...' : 'Make Host'}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <footer
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
        }}
      >
        {!isPlayerInLobby ? (
          <LoadingButton onClick={handleJoinLobby} isLoading={isJoining} style={{ width: '100%' }}>
            Join Lobby
          </LoadingButton>
        ) : (
          <div style={{ textAlign: 'center', width: '100%' }}>
            {isHost ? (
              <button onClick={() => alert('Start Game Coming Soon!')} style={{ width: '100%' }}>
                Start Game
              </button>
            ) : (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  color: 'var(--primary-green)',
                  backgroundColor: 'rgba(34, 197, 94, 0.05)',
                  borderRadius: 'var(--radius-lg)',
                }}
              >
                <p style={{ fontWeight: 600 }}>Waiting for host to start...</p>
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}

export default LobbyDetail;
