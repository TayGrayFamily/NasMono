import React, { useState } from 'react';
import { LoadingButton } from './ui/LoadingButton';

interface User {
  id: string;
  name: string;
}

interface PlayerSetupProps {
  onUserCreated: (user: User) => void;
}

function PlayerSetup({ onUserCreated }: PlayerSetupProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError(null);
    setIsLoading(true);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

    fetch(`${backendUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: userName }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Login failed: ${await response.text()}`);
        }
        return response.json();
      })
      .then((user: User) => {
        onUserCreated(user);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Login failed.');
        setIsLoading(false);
      });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '400px',
        margin: '0 auto',
        width: '100%',
      }}
    >
      <header>
        <h2>Get Started</h2>
        <p className="text-muted">Enter your name to join the game hub.</p>
      </header>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid var(--error-color)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--error-color)',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="playerName"
            style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}
          >
            Display Name
          </label>
          <input
            id="playerName"
            type="text"
            placeholder="e.g. Alex"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
            autoFocus
          />
        </div>
        <LoadingButton onClick={handleLogin} isLoading={isLoading} style={{ width: '100%' }}>
          Join Game
        </LoadingButton>
      </div>
    </div>
  );
}

export default PlayerSetup;
