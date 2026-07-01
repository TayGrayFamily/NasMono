/// <reference types="vite/client" />
import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import PlayerSetup from './components/PlayerSetup';
import LobbyList from './components/LobbyList';
import LobbyDetail from './components/LobbyDetail';
import ManageUser from './components/ManageUser';
import { SocketProvider, useSocket } from './components/SocketContext';
import { Header } from './components/layout/Header';
import { apiFetch } from './lib/api';
import { USER_STORAGE_KEY, getLastLobbyId, setLastLobbyId } from './lib/session';
import './index.css';

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

function LobbyDetailRoute({
  currentUserId,
  onBack,
}: {
  currentUserId: string;
  onBack: () => void;
}) {
  const { lobbyId = '' } = useParams<{ lobbyId: string }>();
  return <LobbyDetail lobbyId={lobbyId} currentUserId={currentUserId} onBack={onBack} />;
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
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lobbyRestoreAttempted, setLobbyRestoreAttempted] = useState(false);

  useEffect(() => {
    const invalidateLobbies = () => {
      queryClient.invalidateQueries({ queryKey: ['lobbies'] });
    };

    socket.on('lobby_created', invalidateLobbies);
    socket.on('lobby_updated', invalidateLobbies);
    socket.on('lobby_deleted', invalidateLobbies);

    return () => {
      socket.off('lobby_created', invalidateLobbies);
      socket.off('lobby_updated', invalidateLobbies);
      socket.off('lobby_deleted', invalidateLobbies);
    };
  }, [socket, queryClient]);

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

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

  useEffect(() => {
    if (currentUser && !socket.connected) {
      socket.connect();
    }
  }, [currentUser, socket]);

  useEffect(() => {
    if (!currentUser && location.pathname !== '/login') {
      navigate('/login');
    } else if (currentUser && location.pathname === '/login') {
      navigate('/lobbies');
    }
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    if (!currentUser || !isConnected || lobbyRestoreAttempted) return;
    if (location.pathname.startsWith('/lobbies/')) {
      setLobbyRestoreAttempted(true);
      return;
    }

    const lastLobbyId = getLastLobbyId();
    if (!lastLobbyId) {
      setLobbyRestoreAttempted(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const response = await fetch(`/api/lobbies/${lastLobbyId}`);
        if (!response.ok) {
          setLastLobbyId(null);
          return;
        }
        const lobby = await response.json();
        const isMember = lobby.players?.some((p: { id: string }) => p.id === currentUser.id);
        if (!cancelled && isMember) {
          socket.emit('join_lobby_room', { lobbyId: lastLobbyId, userId: currentUser.id });
          navigate(`/lobbies/${lastLobbyId}`, { replace: true });
        } else {
          setLastLobbyId(null);
        }
      } catch {
        // ignore restore errors
      } finally {
        if (!cancelled) setLobbyRestoreAttempted(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentUser, isConnected, lobbyRestoreAttempted, location.pathname, navigate, socket]);

  const handleLobbyJoined = useCallback(
    (id: string) => {
      setLastLobbyId(id);
      navigate(`/lobbies/${id}`);
    },
    [navigate],
  );

  const handleSignOut = async () => {
    if (currentUser) {
      const lastLobbyId = getLastLobbyId();
      if (lastLobbyId) {
        try {
          await apiFetch(
            `/api/lobbies/${lastLobbyId}/leave`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.id }),
            },
            socket.id,
          );
          socket.emit('leave_lobby_room', { lobbyId: lastLobbyId, userId: currentUser.id });
        } catch {
          // best-effort leave on sign out
        }
      }
    }

    setLastLobbyId(null);
    socket.disconnect();
    onSignOut();
  };

  return (
    <div className="app-container">
      <Header
        title="Game Hub"
        subtitle="Join a lobby or start a game."
        currentUser={currentUser}
        isConnected={isConnected}
        onSignOut={handleSignOut}
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
                  <LobbyList currentUserId={currentUser.id} onJoinLobby={handleLobbyJoined} />
                }
              />
              <Route
                path="/lobbies/:lobbyId"
                element={
                  <LobbyDetailRoute
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

      <footer className="app-footer">v{__APP_VERSION__}</footer>
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

  return (
    <SocketProvider url="/">
      <Router>
        <AppContent
          currentUser={currentUser}
          onUserCreated={setCurrentUser}
          onUserUpdated={setCurrentUser}
          onSignOut={() => setCurrentUser(null)}
        />
      </Router>
    </SocketProvider>
  );
}

export default App;
