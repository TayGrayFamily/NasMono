import React, { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface Lobby {
  id: string;
  created_at: string;
  playerCount: number;
}

interface LobbyDetail extends Lobby {
  players: Player[];
}

interface LobbyListProps {
  currentPlayerId: string | null;
  onCreateLobby: () => void; // Callback to trigger lobby creation UI
  onLobbySelect: (lobbyId: string) => void; // Callback to view lobby details
}

function LobbyList({ currentPlayerId, onCreateLobby, onLobbySelect }: LobbyListProps) {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLobbies = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/lobbies');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch lobbies');
      }
      const data: Lobby[] = await response.json();
      setLobbies(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLobbies();
    // Optional: Set up polling or WebSocket for real-time lobby updates
  }, []);

  // Function to handle joining a lobby (would likely involve moving to a LobbyDetail view)
  const handleJoinLobby = async (lobbyId: string) => {
    if (!currentPlayerId) {
      setError('Player not selected. Please create or log in first.');
      return;
    }
    try {
      // Assuming a POST request to join. The backend logic might need to be adapted for this.
      // For now, we'll just navigate or log.
      // TODO: Implement actual join logic and navigation
      console.log(`Attempting to join lobby ${lobbyId} as player ${currentPlayerId}`);
      onLobbySelect(lobbyId); // Navigate to lobby detail view
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Lobbies</h2>
      {currentPlayerId && <button onClick={onCreateLobby}>Create New Lobby</button>}

      {loading && <p>Loading lobbies...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && lobbies.length === 0 && (
        <p>No lobbies found. Create one to get started!</p>
      )}

      {!loading && !error && lobbies.length > 0 && (
        <ul>
          {lobbies.map((lobby) => (
            <li
              key={lobby.id}
              style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '10px' }}
            >
              <p>
                <strong>Lobby ID:</strong> {lobby.id.substring(0, 6)}...
              </p>
              <p>Players: {lobby.playerCount}</p>
              <p>Created: {new Date(lobby.created_at).toLocaleString()}</p>
              <button onClick={() => handleJoinLobby(lobby.id)}>View/Join Lobby</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default LobbyList;
