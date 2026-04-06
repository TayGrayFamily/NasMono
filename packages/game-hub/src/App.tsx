import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
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
  const socketRef = useRef<any>(null);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
    socketRef.current = io(backendUrl);

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  return (
    <div className="container">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Game Hub</h1>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </header>

      <main className="panel">
        {currentView === 'playerSetup' && (
          <PlayerSetup
            onUserCreated={(user) => {
              setCurrentUser(user);
              setCurrentView('lobbyList');
            }}
          />
        )}
        {currentView === 'lobbyList' && currentUser && (
          <LobbyList
            currentUserId={currentUser.id}
            onSelectLobby={(id) => {
              setSelectedLobbyId(id);
              setCurrentView('lobbyDetail');
            }}
          />
        )}
        {currentView === 'lobbyDetail' && selectedLobbyId && currentUser && (
          <LobbyDetail
            lobbyId={selectedLobbyId}
            currentUserId={currentUser.id}
            onBack={() => {
              setSelectedLobbyId(null);
              setCurrentView('lobbyList');
            }}
            socket={socketRef.current}
          />
        )}
      </main>
    </div>
  );
}

export default App;
