/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import PlayerSetup from './components/PlayerSetup';
import LobbyList from './components/LobbyList';
import LobbyDetail from './components/LobbyDetail';
import { SocketProvider, useSocket } from './components/SocketContext'; // Import SocketProvider and useSocket
import './index.css';

interface User {
  id: string;
  name: string;
  is_temporary: boolean;
}

// Helper component to correctly call useSocket within the Provider's scope and handle conditional rendering
function AppContent({
  currentUser,
  setCurrentUser,
  currentView,
  setCurrentView,
  selectedLobbyId,
  setSelectedLobbyId,
  handlePlayerCreated,
  handleLobbySelect,
  handleBackToLobbies,
}: {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  currentView: 'playerSetup' | 'lobbyList' | 'lobbyDetail';
  setCurrentView: React.Dispatch<React.SetStateAction<'playerSetup' | 'lobbyList' | 'lobbyDetail'>>;
  selectedLobbyId: string | null;
  setSelectedLobbyId: React.Dispatch<React.SetStateAction<string | null>>;
  handlePlayerCreated: (user: User) => void;
  handleLobbySelect: (lobbyId: string) => void;
  handleBackToLobbies: () => void;
}) {
  const socket = useSocket();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // If we have a user, ensure they are registered on the server whenever we connect
    if (currentUser) {
      socket.emit('set_user', { userId: currentUser.id });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (isConnected && currentUser) {
      socket.emit('set_user', { userId: currentUser.id });
    }
  }, [isConnected, currentUser, socket]);

  return (
    <div className="container">
      <header className="main-header">
        <div className="header-content">
          <h1 className="header-title">Game Hub</h1>
          <p className="header-subtitle">Welcome back. Join a lobby or start a game.</p>
        </div>
        <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Online' : 'Offline'}
        </div>
      </header>

      <main className="panel">
        {currentView === 'playerSetup' && <PlayerSetup onUserCreated={handlePlayerCreated} />}
        {currentView === 'lobbyList' && currentUser && (
          <LobbyList currentUserId={currentUser.id} onSelectLobby={handleLobbySelect} />
        )}
        {currentView === 'lobbyDetail' && selectedLobbyId && currentUser && (
          <LobbyDetail
            lobbyId={selectedLobbyId}
            currentUserId={currentUser.id}
            onBack={handleBackToLobbies}
          />
        )}
      </main>

      <footer
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          width: '100%',
          padding: '0.25rem 1rem',
          fontSize: '0.65rem',
          textAlign: 'center',
          backgroundColor: 'transparent',
          color: '#888',
        }}
      >
        v0.0.34 | {isConnected ? `SID: ${socket.id}` : 'Disconnected'}
      </footer>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'playerSetup' | 'lobbyList' | 'lobbyDetail'>(
    'playerSetup',
  );
  const [selectedLobbyId, setSelectedLobbyId] = useState<string | null>(null);

  // Handlers defined here to manage state
  const handlePlayerCreated = (user: User) => {
    setCurrentUser(user);
    setCurrentView('lobbyList');
    // Once user is set, ensure socket knows about this user
    // Accessing socket via context provider is implicit in components,
    // but here we need a way to emit from App.
    // Let's modify AppContent or use a specialized component/hook for this.
  };

  const handleLobbySelect = (lobbyId: string) => {
    setSelectedLobbyId(lobbyId);
    setCurrentView('lobbyDetail');
    // Note: socket emission logic should ideally be within AppContent or a component
    // that has direct access to the socket instance after it's confirmed available.
    // For now, assuming handlers might be called after socket is available.
  };

  const handleBackToLobbies = () => {
    setCurrentView('lobbyList');
    setSelectedLobbyId(null);
  };

  return (
    // App renders SocketProvider, and passes state/handlers to AppContent
    <SocketProvider url="/">
      <AppContent
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        currentView={currentView}
        setCurrentView={setCurrentView}
        selectedLobbyId={selectedLobbyId}
        setSelectedLobbyId={setSelectedLobbyId}
        handlePlayerCreated={handlePlayerCreated}
        handleLobbySelect={handleLobbySelect}
        handleBackToLobbies={handleBackToLobbies}
      />
    </SocketProvider>
  );
}

export default App;
