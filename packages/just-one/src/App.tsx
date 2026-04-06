import { useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function App() {
  const [lobbyId, setLobbyId] = useState('');
  const [joined, setJoined] = useState(false);

  const joinLobby = () => {
    socket.emit('join-lobby', lobbyId);
    setJoined(true);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Just One - Lobby</h1>
      {!joined ? (
        <div>
          <input
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
            placeholder="Enter Lobby ID"
          />
          <button onClick={joinLobby}>Join</button>
        </div>
      ) : (
        <p>Joined lobby: {lobbyId}</p>
      )}
    </div>
  );
}
