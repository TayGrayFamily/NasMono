import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingButton } from './ui/LoadingButton';
import { useScreenMode } from '../hooks/useScreenMode';

interface Lobby {
  id: string;
  name: string;
  playerCount: number;
}

interface LobbyListProps {
  currentUserId: string;
  onSelectLobby: (id: string) => void;
}

function LobbyList({ currentUserId, onSelectLobby }: LobbyListProps) {
  const [newLobbyName, setNewLobbyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const mode = useScreenMode();

  const {
    data: lobbies = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['lobbies'],
    queryFn: async () => {
      const response = await fetch('/api/lobbies');
      if (!response.ok) throw new Error('Failed to fetch lobbies');
      return response.json();
    },
  });

  const createLobbyMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, userId: currentUserId }),
      });
      if (!res.ok) throw new Error('Failed to create lobby');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
      onSelectLobby(data.lobbyId);
      setNewLobbyName('');
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    },
  });

  const createLobby = () => {
    if (!newLobbyName.trim()) {
      setError('Lobby name cannot be empty.');
      return;
    }
    createLobbyMutation.mutate(newLobbyName);
  };

  if (isLoading) return <div className="panel">Loading lobbies...</div>;
  if (isError)
    return (
      <div className="panel" style={{ color: 'var(--error-color)' }}>
        Failed to load lobbies.
      </div>
    );

  return (
    <div className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h2>Game Lobbies</h2>
        <p className="text-muted">Join an existing game or start a new one.</p>
      </header>

      <section
        style={{
          display: 'flex',
          gap: '0.75rem',
          flexDirection: mode === 'mobile' ? 'column' : 'row',
          padding: '1.25rem',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: 'var(--radius-lg)',
          border: '1px dashed var(--border-color)',
        }}
      >
        <input
          placeholder="Enter lobby name..."
          value={newLobbyName}
          onChange={(e) => setNewLobbyName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createLobby()}
          style={{ flexGrow: 1 }}
        />
        <LoadingButton
          onClick={createLobby}
          isLoading={createLobbyMutation.isPending}
          style={{ minWidth: mode === 'mobile' ? '100%' : '140px' }}
        >
          Create Lobby
        </LoadingButton>
      </section>

      {error && (
        <p style={{ color: 'var(--error-color)', fontSize: '0.875rem', margin: 0 }}>{error}</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-muted)' }}>Active Lobbies</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              mode === 'mobile' ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1rem',
          }}
        >
          {lobbies.length === 0 && (
            <div
              style={{
                gridColumn: '1/-1',
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              No active lobbies found. Create one above!
            </div>
          )}
          {lobbies.map((l: Lobby) => (
            <div
              key={l.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              onClick={() => onSelectLobby(l.id)}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary-cyan)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                  {l.name}
                </div>
                <div
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'var(--primary-green)',
                    }}
                  ></span>
                  {l.playerCount} {l.playerCount === 1 ? 'Player' : 'Players'}
                </div>
              </div>
              <button
                className="secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
              >
                Join
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LobbyList;
