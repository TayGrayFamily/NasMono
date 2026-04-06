import React, { useState, useEffect } from 'react';

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
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [newLobbyName, setNewLobbyName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchLobbies = async () => {
    try {
      const response = await fetch('/api/lobbies');
      if (response.ok) setLobbies(await response.json());
    } catch (err) {
      console.error('Failed to fetch lobbies');
    }
  };

  const createLobby = async () => {
    if (!newLobbyName.trim()) return;
    try {
      const res = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLobbyName, userId: currentUserId }),
      });
      if (res.ok) {
        const { lobbyId } = await res.json();
        onSelectLobby(lobbyId);
      } else {
        setError('Failed to create lobby');
      }
    } catch (err) {
      setError('Error creating lobby');
    }
  };

  useEffect(() => {
    fetchLobbies();
  }, []);

  return (
    <div className="panel">
      <h2>Lobbies</h2>
      <div style={{ marginBottom: '20px' }}>
        <input
          placeholder="New Lobby Name"
          value={newLobbyName}
          onChange={(e) => setNewLobbyName(e.target.value)}
        />
        <button onClick={createLobby}>Create Lobby</button>
      </div>
      {lobbies.map((l) => (
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
    </div>
  );
}

export default LobbyList;
