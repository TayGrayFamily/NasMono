import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface UserSetupProps {
  onUserCreated: (user: User) => void;
}

function PlayerSetup({ onUserCreated }: UserSetupProps) {
  const [userName, setUserName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!userName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError(null);

    try {
      const response = await fetch('/api/login', {
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
    } catch (err: any) {
      setError(err.message);
      console.error('Error during login:', err);
    }
  };

  return (
    <div className="panel">
      <h2>Welcome</h2>
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={handleLogin}>Log In / Sign Up</button>
    </div>
  );
}

export default PlayerSetup;
