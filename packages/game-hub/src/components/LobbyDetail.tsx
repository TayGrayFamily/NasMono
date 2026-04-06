import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface LobbyDetailData {
  id: string;
  created_at: string;
  players: Player[];
}

interface LobbyDetailProps {
  lobbyId: string | null;
  currentPlayerId: string | null;
  onBackToList: () => void;
  socket: any;
}

function LobbyDetail({ lobbyId, currentPlayerId, onBackToList, socket }: LobbyDetailProps) {
  const [lobby, setLobby] = useState<LobbyDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const socketRef = useRef(socket);

  useEffect(() => {
    if (!lobbyId) {
      onBackToList();
      return;
    }

    const fetchLobbyDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/lobbies/${lobbyId}`);
        const responseBody = await response.text(); // Read the response body ONCE as text

        if (!response.ok) {
          let errorMsg = `HTTP error ${response.status}`;
          if (responseBody) {
            try {
              // Try to parse error details from backend if body exists
              const errorData = JSON.parse(responseBody);
              errorMsg = errorData.error || JSON.stringify(errorData);
            } catch (e) {
              // If parsing fails, use the raw text as error message
              errorMsg = `HTTP error ${response.status}: ${responseBody || 'Unknown error'}`;
            }
          } else {
            errorMsg = `HTTP error ${response.status}: No response body received.`;
          }
          throw new Error(errorMsg);
        }

        // If response is OK, parse the text as JSON
        if (!responseBody) {
          throw new Error('Failed to fetch lobby details: No data received.');
        }
        let data: LobbyDetailData;
        try {
          data = JSON.parse(responseBody);
        } catch (e) {
          throw new Error('Failed to parse lobby data: Invalid JSON received.');
        }
        setLobby(data);
        console.log('Initial lobby data:', data);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching lobby details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLobbyDetails();

    // --- Socket.IO Listeners ---
    if (socketRef.current) {
      socketRef.current.emit('join_lobby_room', { lobbyId, playerId: currentPlayerId });
      console.log(`Emitted join_lobby_room for lobby ${lobbyId}, player ${currentPlayerId}`);

      const handlePlayerJoined = (data: {
        lobbyId: string;
        playerId: string;
        playerName: string;
        isTemporary: boolean;
      }) => {
        if (data.lobbyId === lobbyId) {
          console.log('Received player_joined event:', data);
          setLobby((currentLobby) => {
            if (!currentLobby) return null;
            if (currentLobby.players.some((p) => p.id === data.playerId)) {
              return currentLobby;
            }
            return {
              ...currentLobby,
              players: [
                ...currentLobby.players,
                { id: data.playerId, name: data.playerName, is_temporary: data.isTemporary },
              ],
            };
          });
        }
      };

      const handlePlayerLeft = (data: { lobbyId: string; playerId: string }) => {
        if (data.lobbyId === lobbyId) {
          console.log('Received player_left event:', data);
          setLobby((currentLobby) => {
            if (!currentLobby) return null;
            return {
              ...currentLobby,
              players: currentLobby.players.filter((player) => player.id !== data.playerId),
            };
          });
        }
      };

      socketRef.current.on('player_joined', handlePlayerJoined);
      socketRef.current.on('player_left', handlePlayerLeft);

      return () => {
        socketRef.current.off('player_joined', handlePlayerJoined);
        socketRef.current.off('player_left', handlePlayerLeft);
      };
    }
  }, [lobbyId, currentPlayerId, onBackToList, socketRef]);

  const handleJoinLobby = async () => {
    if (!lobbyId || !currentPlayerId) {
      setError('Cannot join lobby. Player or lobby ID missing.');
      return;
    }
    setError(null);
    setIsJoining(true);
    try {
      const response = await fetch(`/api/lobbies/${lobbyId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: currentPlayerId }),
      });

      const responseBody = await response.text(); // Read the response body ONCE as text

      if (!response.ok) {
        let errorMsg = `HTTP error ${response.status}`;
        if (responseBody) {
          try {
            // Try to parse error details from backend if body exists
            const errorData = JSON.parse(responseBody);
            errorMsg = errorData.error || JSON.stringify(errorData);
          } catch (e) {
            // If parsing fails, use the raw text as error message
            errorMsg = `HTTP error ${response.status}: ${responseBody || 'Unknown error'}`;
          }
        } else {
          errorMsg = `HTTP error ${response.status}: No response body received.`;
        }
        throw new Error(errorMsg);
      }

      // API call was successful. Player is added to DB.
      // Server will broadcast 'player_joined' via Socket.IO, updating the state.
      console.log('Join request successful. Waiting for Socket.IO update...');
    } catch (err: any) {
      setError(err.message);
      console.error('Error joining lobby via API:', err);
    } finally {
      setIsJoining(false); // Hide joining state
    }
  };

  const isPlayerInLobby = lobby?.players.some((p) => p.id === currentPlayerId);

  if (loading) return <p>Loading lobby details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!lobby) return <p>Lobby not found.</p>;

  return (
    <div>
      <h2>Lobby Details</h2>
      <p>
        <strong>Lobby ID:</strong> {lobby.id.substring(0, 6)}...
      </p>
      <p>
        <strong>Created:</strong> {new Date(lobby.created_at).toLocaleString()}
      </p>

      <h3>Players ({lobby.players.length})</h3>
      {lobby.players.length === 0 ? (
        <p>No players in this lobby yet.</p>
      ) : (
        <ul>
          {lobby.players.map((player) => (
            <li key={player.id}>
              {player.name} {player.is_temporary ? '(Temp)' : ''}
            </li>
          ))}
        </ul>
      )}

      {currentPlayerId && !isPlayerInLobby && (
        <button onClick={handleJoinLobby} disabled={isJoining}>
          {isJoining ? 'Joining...' : 'Join Lobby'}
        </button>
      )}
      {isPlayerInLobby && <p>You are already in this lobby.</p>}

      <button onClick={onBackToList}>Back to Lobbies</button>
    </div>
  );
}

export default LobbyDetail;
