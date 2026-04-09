/// <reference types="vite/client" />
import React, { useState } from 'react';
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

  return (
    <div className="container">
      <header className="main-header">
        <div className="header-content">
          <h1 className="header-title">Game Hub</h1>
          <p className="header-subtitle">Welcome back. Join a lobby or start a game.</p>
        </div>
        <div className={`status-indicator ${socket.connected ? 'connected' : 'disconnected'}`}>
          {socket.connected ? 'Online' : 'Offline'}
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
    <SocketProvider url="http://localhost:3001">
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
