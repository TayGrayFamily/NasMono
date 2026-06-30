/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import PlayerSetup from './components/PlayerSetup';
import LobbyList from './components/LobbyList';
import LobbyDetail from './components/LobbyDetail';
import ManageUser from './components/ManageUser';
import { SocketProvider, useSocket } from './components/SocketContext';
import { Header } from './components/layout/Header';
import './index.css';

const USER_STORAGE_KEY = 'game-hub-user';

interface User {
  id: string;
  name: string;
}

function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (parsed?.id && parsed?.name) return parsed;
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function AppContent({
  currentUser,
  onUserCreated,
  onUserUpdated,
  onSignOut,
}: {
  currentUser: User | null;
  onUserCreated: (user: User) => void;
  onUserUpdated: (user: User) => void;
  onSignOut: () => void;
}) {
  const socket = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
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

    socket.onAny((eventName, ...args) => {
      console.log(`[Socket Incoming] ${eventName}:`, args);
    });

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

  // Handle protected routes
  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    } else if (currentUser && location.pathname === '/login') {
      navigate('/lobbies');
    }
  }, [currentUser, location.pathname, navigate]);

  return (
    <div className="app-container">
      <Header
        title="Game Hub"
        subtitle="Join a lobby or start a game."
        currentUser={currentUser}
        isConnected={isConnected}
        onSignOut={onSignOut}
        onManageUser={() => navigate('/manage-profile')}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              <div className="panel">
                <PlayerSetup onUserCreated={onUserCreated} />
              </div>
            }
          />

          {currentUser && (
            <>
              <Route
                path="/lobbies"
                element={
                  <LobbyList
                    currentUserId={currentUser.id}
                    onSelectLobby={(id) => navigate(`/lobbies/${id}`)}
                  />
                }
              />
              <Route
                path="/lobbies/:lobbyId"
                element={
                  <LobbyDetail
                    lobbyId={location.pathname.split('/').pop() || ''}
                    currentUserId={currentUser.id}
                    onBack={() => navigate('/lobbies')}
                  />
                }
              />
              <Route
                path="/manage-profile"
                element={<ManageUser currentUser={currentUser} onUserUpdated={onUserUpdated} />}
              />
            </>
          )}

          <Route path="*" element={<Navigate to={currentUser ? '/lobbies' : '/login'} replace />} />
        </Routes>
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
        v{__APP_VERSION__} • {isConnected ? 'Connected' : 'Disconnected'}
      </footer>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStoredUser());

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  const handleUserCreated = (user: User) => {
    setCurrentUser(user);
  };

  const handleUserUpdated = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
    console.log('User signed out');
  };

  return (
    <SocketProvider url="/">
      <Router>
        <AppContent
          currentUser={currentUser}
          onUserCreated={handleUserCreated}
          onUserUpdated={handleUserUpdated}
          onSignOut={handleSignOut}
        />
      </Router>
    </SocketProvider>
  );
}

export default App;
