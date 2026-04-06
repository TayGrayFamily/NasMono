import React, { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
}

interface LobbyDetailData {
  id: string;
  created_at: string;
  players: Player[];
}

interface LobbyDetailProps {
  lobbyId: string;
  currentUserId: string;
  onBack: () => void;
  socket: Socket;
}

function LobbyDetail({ lobbyId, currentUserId, onBack, socket }: LobbyDetailProps) {
  const [lobby, setLobby] = useState<LobbyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchLobbyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/lobbies/${lobbyId}`);
        const responseBody = await response.text();

        if (!response.ok) {
          throw new Error(`Failed to fetch lobby: ${responseBody || response.statusText}`);
        }

        const data: LobbyDetailData = JSON.parse(responseBody);
        setLobby(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
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

    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_left', handlePlayerLeft);

    return () => {
      socket.off('player_joined', handlePlayerJoined);
      socket.off('player_left', handlePlayerLeft);
    };
  }, [lobbyId, socket]);

  const handleJoinLobby = async () => {
    setIsJoining(true);
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (!response.ok) throw new Error('Failed to join lobby');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;
  if (!lobby) return <p>Lobby not found.</p>;

  const isPlayerInLobby = lobby.players.some((p) => p.id === currentUserId);

  return (
    <div>
      <h3>Lobby: {lobby.id.substring(0, 8)}</h3>
      <ul>
        {lobby.players.map((p) => (
          <li key={p.id}>{p.name}</li>
        ))}
      </ul>
      {!isPlayerInLobby && (
        <button onClick={handleJoinLobby} disabled={isJoining}>
          {isJoining ? 'Joining...' : 'Join Lobby'}
        </button>
      )}
      <button onClick={onBack}>Back</button>
    </div>
  );
}

export default LobbyDetail;
