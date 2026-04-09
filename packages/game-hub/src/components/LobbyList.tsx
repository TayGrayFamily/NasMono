import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
      setError(err.message);
    },
  });

  const createLobby = () => {
    if (!newLobbyName.trim()) {
      setError('Lobby name cannot be empty.');
      return;
    }
    createLobbyMutation.mutate(newLobbyName);
  };

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Failed to load lobbies.</div>;

  return (
    <div className="panel">
      <h2>Lobbies</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="New Lobby Name"
          value={newLobbyName}
          onChange={(e) => setNewLobbyName(e.target.value)}
        />
        <button onClick={createLobby} disabled={createLobbyMutation.isPending}>
          {createLobbyMutation.isPending ? 'Creating...' : 'Create Lobby'}
        </button>
      </div>
      {lobbies.map((l: Lobby) => (
        <div
          key={l.id}
          style={{
            marginBottom: '10px',
            padding: '10px',
            border: '1px solid #334155',
            borderRadius: '8px',
          }}
        >
          <strong>{l.name}</strong> - {l.playerCount} players
          <button style={{ marginLeft: '10px' }} onClick={() => onSelectLobby(l.id)}>
            Join
          </button>
        </div>
      ))}
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
    </div>
  );
}

export default LobbyList;
