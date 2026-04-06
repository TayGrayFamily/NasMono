import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import PlayerSetup from './components/PlayerSetup';
import LobbyList from './components/LobbyList';
import LobbyDetail from './components/LobbyDetail';
import './index.css';

interface User {
  id: string;
  name: string;
  is_temporary: boolean;
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'playerSetup' | 'lobbyList' | 'lobbyDetail'>(
    'playerSetup',
  );
  const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    const socketInstance = io(backendUrl);

    socketInstance.on('connect', () => setIsConnected(true));
    socketInstance.on('disconnect', () => setIsConnected(false));

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const handlePlayerCreated = (user: User) => {
    setCurrentUser(user);
    setCurrentView('lobbyList');
  };

  const handleCreateLobby = async () => {
    if (!currentUser || !socket) return;

    try {
      const response = await fetch('/api/lobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create lobby');
      }

      const data = await response.json();
      if (data.lobbyId) {
        setSelectedLobbyId(data.lobbyId);
        setCurrentView('lobbyDetail');
        socket.emit('join_lobby_room', { lobbyId: data.lobbyId, userId: currentUser.id });
      }
    } catch (error: unknown) {
      console.error('Error creating lobby:', error);
      alert(`Failed to create lobby: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const handleLobbySelect = (lobbyId: string) => {
    setSelectedLobbyId(lobbyId);
    setCurrentView('lobbyDetail');
    if (socket && currentUser) {
      socket.emit('join_lobby_room', { lobbyId, userId: currentUser.id });
    }
  };

  const handleBackToLobbies = () => {
    if (socket && selectedLobbyId) {
      // Optional: socket.emit('leave_lobby_room', { lobbyId: selectedLobbyId });
    }
    setCurrentView('lobbyList');
    setSelectedLobbyId(null);
  };

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Game Hub</h1>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </header>

      <main className="panel">
        {currentView === 'playerSetup' && <PlayerSetup onUserCreated={handlePlayerCreated} />}
        {currentView === 'lobbyList' && currentUser && (
          <LobbyList currentUserId={currentUser.id} onSelectLobby={handleLobbySelect} />
        )}
        {currentView === 'lobbyDetail' && selectedLobbyId && currentUser && socket && (
          <LobbyDetail
            lobbyId={selectedLobbyId}
            currentUserId={currentUser.id}
            onBack={handleBackToLobbies}
            socket={socket}
          />
        )}
      </main>
    </div>
  );
}

export default App;
