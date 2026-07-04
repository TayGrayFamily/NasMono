import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingButton } from './ui/LoadingButton';
import { useSocket } from './SocketContext';
import { apiFetch } from '../lib/api';
import { Page, PageHeader } from './layout/Page';
import { LobbyCard, LobbyGrid, type LobbyCardData } from './lobby/LobbyCard';
import './LobbyList.css';

interface LobbyListProps {
  currentUserId: string;
  onJoinLobby: (id: string) => void;
}

function LobbyList({ currentUserId, onJoinLobby }: LobbyListProps) {
  const socket = useSocket();
  const [newLobbyName, setNewLobbyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: lobbies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['lobbies'],
    queryFn: async () => {
      const response = await fetch('/api/lobbies');
      if (!response.ok) throw new Error('Failed to fetch lobbies');
      return response.json() as Promise<LobbyCardData[]>;
    },
  });

  const createLobbyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await apiFetch(
        '/api/lobbies',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, userId: currentUserId }),
        },
        socket.id,
      );
      if (!res.ok) throw new Error('Failed to create lobby');
      return res.json() as Promise<{ lobbyId: string }>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      onJoinLobby(data.lobbyId);
      setNewLobbyName('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    },
  });

  const handleCreateLobby = () => {
    if (!newLobbyName.trim()) {
      setError('Lobby name cannot be empty.');
      return;
    }
    createLobbyMutation.mutate(newLobbyName);
  };

  const handleJoinLobby = async (lobbyId: string) => {
    setJoiningId(lobbyId);
    setError(null);
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
      if (!response.ok) {
        const text = await response.text();
        let message = 'Failed to join lobby';
        try {
          const parsed = JSON.parse(text) as { error?: string };
          if (parsed.error) message = parsed.error;
        } catch {
          if (text) message = text;
        }
        throw new Error(message);
      }
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      onJoinLobby(lobbyId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to join lobby');
    } finally {
      setJoiningId(null);
    }
  };

  if (isLoading) return <div className="panel">Loading lobbies...</div>;
  if (isError)
    return (
      <div className="panel" style={{ color: 'var(--error-color)' }}>
        Failed to load lobbies.
      </div>
    );

  return (
    <div className="panel lobby-list">
      <Page>
        <PageHeader title="Game Lobbies" subtitle="Join an existing game or start a new one." />

        <section className="lobby-list__create">
          <input
            placeholder="Enter lobby name..."
            value={newLobbyName}
            onChange={(e) => setNewLobbyName(e.target.value)}
            onKeyDown={(e) =>
              e.key === 'Enter' && !createLobbyMutation.isPending && handleCreateLobby()
            }
            aria-label="Lobby name"
          />
          <LoadingButton
            className="lobby-list__create-btn"
            onClick={handleCreateLobby}
            isLoading={createLobbyMutation.isPending}
          >
            Create Lobby
          </LoadingButton>
        </section>

        {error && <p className="lobby-list__error">{error}</p>}

        <section className="lobby-list__section">
          <h3 className="lobby-list__section-title">Active Lobbies</h3>
          <LobbyGrid>
            {lobbies.length === 0 && (
              <div className="lobby-list-empty">No active lobbies found. Create one above!</div>
            )}
            {lobbies.map((lobby) => (
              <LobbyCard
                key={lobby.id}
                lobby={lobby}
                onJoin={handleJoinLobby}
                disabled={joiningId === lobby.id}
              />
            ))}
          </LobbyGrid>
        </section>
      </Page>
    </div>
  );
}

export default LobbyList;
