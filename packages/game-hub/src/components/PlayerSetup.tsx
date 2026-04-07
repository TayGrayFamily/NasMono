import React, { useState } from 'react';

interface User {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface PlayerSetupProps {
  // Using PlayerSetupProps for consistency with component name
  onUserCreated: (user: User) => void;
}

function PlayerSetup({ onUserCreated }: PlayerSetupProps) {
  // Using PlayerSetupProps
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

      const responseBody = await response.text(); // Read as text first to inspect

      if (!response.ok) {
        // Throw an error including the response body for better debugging
        throw new Error(`Login failed: ${responseBody || response.statusText}`);
      }

      // Parse the JSON response only if the request was successful
      const user: User = JSON.parse(responseBody);
      onUserCreated(user);
    } catch (err: unknown) {
      // Using 'unknown' for safer error handling
      // Display the error message to the user
      setError(err instanceof Error ? err.message : 'An unknown error occurred during login.');
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
