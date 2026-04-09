import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface PlayerSetupProps {
  onUserCreated: (user: User) => void;
}

function PlayerSetup({ onUserCreated }: PlayerSetupProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError(null);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userName }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(`Login failed: ${responseBody || response.statusText}`);
      }

      const user: User = JSON.parse(responseBody);
      onUserCreated(user);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
      console.error('Error during login:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h2 style={{ margin: '0 0 0.5rem 0' }}>Get Started</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          Enter your name to join the game hub.
        </p>
      </div>
      {error && <p style={{ color: 'var(--error-color)', margin: 0 }}>{error}</p>}
      <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
        <input
          type="text"
          placeholder="Player name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
        />
        <button onClick={handleLogin}>Join</button>
      </div>
    </div>
  );
}

export default PlayerSetup;
