import React, { useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { LoadingButton } from './ui/LoadingButton';
import { apiFetch } from '../lib/api';
import { Page, PageHeader } from './layout/Page';
import { StickyActionBar } from './layout/StickyActionBar';
import { PlayerRow, PlayersGrid, type PlayerRowPlayer } from './lobby/PlayerRow';
import { StatusStrip } from './lobby/StatusStrip';
import { ConfirmDialog } from './ui/ConfirmDialog';
import { setLastLobbyId } from '../lib/session';
import './LobbyDetail.css';

interface LobbyDetailData {
  id: string;
  name?: string;
  hostId: string;
  players: PlayerRowPlayer[];
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
  const [isLeaving, setIsLeaving] = useState(false);
  const [isTransferring, setIsTransferring] = useState<string | null>(null);
  const [transferTarget, setTransferTarget] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

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
        if (mounted) {
          setLobby(data);
          setLastLobbyId(lobbyId);
        }
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
        return {
          ...current,
          players: [...current.players, { id: data.userId, name: data.name, connected: false }],
        };
      });
    };

    const handlePlayerLeft = (data: { userId: string }) => {
      if (data.userId === currentUserId) {
        socket?.emit('leave_lobby_room', { lobbyId, userId: currentUserId });
        setLastLobbyId(null);
        onBack();
        return;
      }
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

    const handlePlayerPresence = (data: { userId: string; connected: boolean }) => {
      setLobby((current) => {
        if (!current) return null;
        return {
          ...current,
          players: current.players.map((p) =>
            p.id === data.userId ? { ...p, connected: data.connected } : p,
          ),
        };
      });
    };

    const handleLobbyDeleted = (data: { lobbyId: string }) => {
      if (data.lobbyId === lobbyId) {
        setError('This lobby was closed.');
        setTimeout(() => onBack(), 1500);
      }
    };

    if (socket) {
      socket.emit('join_lobby_room', { lobbyId, userId: currentUserId });
      socket.on('player_joined', handlePlayerJoined);
      socket.on('player_left', handlePlayerLeft);
      socket.on('host_transferred', handleHostTransferred);
      socket.on('player_presence', handlePlayerPresence);
      socket.on('lobby_deleted', handleLobbyDeleted);

      return () => {
        mounted = false;
        socket.emit('leave_lobby_room', { lobbyId, userId: currentUserId });
        socket.off('player_joined', handlePlayerJoined);
        socket.off('player_left', handlePlayerLeft);
        socket.off('host_transferred', handleHostTransferred);
        socket.off('player_presence', handlePlayerPresence);
        socket.off('lobby_deleted', handleLobbyDeleted);
      };
    }

    return () => {
      mounted = false;
    };
  }, [lobbyId, socket, currentUserId, onBack]);

  const handleJoinLobby = async () => {
    setIsJoining(true);
    setActionError(null);
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

      const refresh = await fetch(`/api/lobbies/${lobbyId}`);
      if (refresh.ok) {
        const data: LobbyDetailData = await refresh.json();
        setLobby(data);
        setLastLobbyId(lobbyId);
      }
      socket?.emit('join_lobby_room', { lobbyId, userId: currentUserId });
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsJoining(false);
    }
  };

  const handleTransferHost = async (newHostId: string) => {
    setIsTransferring(newHostId);
    setActionError(null);
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
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsTransferring(null);
      setTransferTarget(null);
    }
  };

  const handleRemovePlayer = async (targetUserId: string) => {
    setIsRemoving(targetUserId);
    setActionError(null);
    try {
      const response = await apiFetch(
        `/api/lobbies/${lobbyId}/kick`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetUserId }),
        },
        socket?.id,
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to remove player');
      }
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsRemoving(null);
      setRemoveTarget(null);
    }
  };

  const leaveLobby = async () => {
    await apiFetch(
      `/api/lobbies/${lobbyId}/leave`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      },
      socket?.id,
    );
    socket?.emit('leave_lobby_room', { lobbyId, userId: currentUserId });
    setLastLobbyId(null);
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    setActionError(null);
    try {
      await leaveLobby();
      onBack();
    } catch (err) {
      console.error('Error leaving lobby:', err);
      setActionError('Failed to leave lobby');
    } finally {
      setIsLeaving(false);
    }
  };

  const handleBack = async () => {
    if (lobby?.players.some((p) => p.id === currentUserId)) {
      try {
        await leaveLobby();
      } catch (err) {
        console.error('Error leaving lobby:', err);
      }
    }
    onBack();
  };

  if (loading) return <div className="panel">Loading lobby details...</div>;
  if (error)
    return (
      <div className="panel lobby-detail__error-panel">
        <h2 className="lobby-detail__error-title">Error</h2>
        <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
          {error}
        </p>
        <button type="button" onClick={onBack}>
          Back to Lobbies
        </button>
      </div>
    );
  if (!lobby) return <div className="panel">Lobby not found.</div>;

  const isPlayerInLobby = lobby.players.some((p) => p.id === currentUserId);
  const isHost = currentUserId === lobby.hostId;
  const connectedCount = lobby.players.filter((p) => p.connected).length;
  const playerLabel =
    connectedCount > 0
      ? `${connectedCount} connected · ${lobby.players.length} players`
      : `${lobby.players.length} ${lobby.players.length === 1 ? 'player' : 'players'}`;

  return (
    <div className="panel">
      <Page>
        <PageHeader
          title={lobby.name || 'Game Lobby'}
          backLabel="← Back to Lobbies"
          onBack={handleBack}
        />

        <section className="lobby-detail__players-section">
          <h3 className="lobby-detail__players-header">
            Players
            <span className="status-badge online lobby-detail__count-badge">{playerLabel}</span>
          </h3>

          <PlayersGrid>
            {lobby.players.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                isYou={p.id === currentUserId}
                isHost={p.id === lobby.hostId}
                showHostMenu={isHost && p.id !== currentUserId}
                onTransferHost={() => setTransferTarget(p.id)}
                onRemovePlayer={() => setRemoveTarget(p.id)}
                isTransferring={isTransferring === p.id}
                isRemoving={isRemoving === p.id}
              />
            ))}
          </PlayersGrid>
        </section>

        {actionError && <p className="lobby-list__error">{actionError}</p>}

        <StickyActionBar>
          {!isPlayerInLobby ? (
            <LoadingButton onClick={handleJoinLobby} isLoading={isJoining}>
              Join Lobby
            </LoadingButton>
          ) : (
            <>
              {isHost ? (
                <>
                  <button type="button" disabled>
                    Start Game
                  </button>
                  <p className="status-strip--coming-soon">Just One coming soon</p>
                </>
              ) : (
                <StatusStrip variant="waiting" title="Waiting for host to start…" />
              )}
              <button
                type="button"
                className="secondary lobby-detail__leave-btn"
                onClick={handleLeave}
                disabled={isLeaving}
              >
                {isLeaving ? 'Leaving…' : 'Leave Lobby'}
              </button>
            </>
          )}
        </StickyActionBar>
      </Page>

      <ConfirmDialog
        open={transferTarget !== null}
        title="Transfer host"
        message="Transfer lobby ownership to this player?"
        confirmLabel="Make host"
        onConfirm={() => transferTarget && handleTransferHost(transferTarget)}
        onCancel={() => setTransferTarget(null)}
      />

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove player"
        message="Remove this player from the lobby?"
        confirmLabel="Remove player"
        onConfirm={() => removeTarget && handleRemovePlayer(removeTarget)}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}

export default LobbyDetail;
