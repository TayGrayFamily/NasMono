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
      if (response.ok) {
        const data = await response.json();
        setLobbies(data);
      } else {
        // Handle non-OK HTTP responses
        setError('Failed to fetch lobbies: Server returned status ' + response.status);
      }
    } catch (err) {
      // Handle network errors or JSON parsing errors
      console.error('Failed to fetch lobbies', err);
      setError('Failed to fetch lobbies due to a network error.');
    }
  };

  const createLobby = async () => {
    if (!newLobbyName.trim()) {
      setError('Lobby name cannot be empty.');
      return;
    }
    try {
      const res = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newLobbyName, userId: currentUserId }),
      });
      if (res.ok) {
        const { lobbyId } = await res.json();
        onSelectLobby(lobbyId); // Assuming onSelectLobby is the desired action after creation
        setNewLobbyName(''); // Clear input after successful creation
        setError(null); // Clear any previous errors
      } else {
        const errorData = await res.json();
        setError(errorData.error || `Failed to create lobby: Server returned status ${res.status}`);
      }
    } catch (err) {
      console.error('Error creating lobby', err);
      setError('Error creating lobby due to a network error.');
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
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
    </div>
  );
}

export default LobbyList;
