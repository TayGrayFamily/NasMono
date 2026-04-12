/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import PlayerSetup from './components/PlayerSetup';
import LobbyList from './components/LobbyList';
import LobbyDetail from './components/LobbyDetail';
import { SocketProvider, useSocket } from './components/SocketContext';
import { Header } from './components/layout/Header';
import './index.css';

interface User {
  id: string;
  name: string;
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
    // Check initial state
    if (socket.connected) {
      console.log('Socket already connected on mount:', socket.id);
      setIsConnected(true);
    }

    const onConnect = () => {
      console.log('Socket connected event:', socket.id);
      setIsConnected(true);
    };
    const onDisconnect = (reason: string) => {
      console.warn('Socket disconnected event. Reason:', reason);
      setIsConnected(false);
    };
    const onConnectError = (error: Error) => {
      console.error('Socket connection error event:', error.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    // Debug: Log all incoming events
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket Incoming] ${eventName}:`, args);
    });

    // If we have a user, ensure they are registered on the server whenever we connect
    if (currentUser) {
      console.log('Emitting set_user for:', currentUser.id);
      socket.emit('set_user', { userId: currentUser.id });
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.offAny();
    };
  }, [socket, currentUser]);

  useEffect(() => {
    if (isConnected && currentUser) {
      socket.emit('set_user', { userId: currentUser.id });
    }
  }, [isConnected, currentUser, socket]);

  return (
    <div className="app-container">
      <Header
        title="Game Hub"
        subtitle="Join a lobby or start a game."
        currentUser={currentUser}
        isConnected={isConnected}
        socketId={socket.id}
      />

      <main className="main-content">
        {currentView === 'playerSetup' && (
          <div className="panel">
            <PlayerSetup onUserCreated={handlePlayerCreated} />
          </div>
        )}
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
          padding: '1.5rem',
          fontSize: '0.875rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          marginTop: 'auto',
        }}
      >
        v{import.meta.env.VITE_APP_VERSION || '0.0.0'} •{' '}
        {isConnected ? 'Connected' : 'Disconnected'}
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
