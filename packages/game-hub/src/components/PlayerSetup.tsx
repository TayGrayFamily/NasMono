import React, { useState } from 'react';

interface Player {
  id: string;
  name: string;
  is_temporary: boolean;
}

interface PlayerSetupProps {
  onUserCreated: (user: Player) => void;
}

function PlayerSetup({ onUserCreated }: PlayerSetupProps) {
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreatePlayer = async () => {
    if (!playerName.trim()) {
      setError('Player name cannot be empty.');
      return;
    }
    setError(null);

    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: playerName }),
      });

      const responseBody = await response.text();

      if (!response.ok) {
        throw new Error(`Failed to create player: ${responseBody || response.statusText}`);
      }

      const player: Player = JSON.parse(responseBody);
      console.log('Player created:', player);
      onUserCreated(player);
    } catch (err: any) {
      setError(err.message);
      console.error('Error creating player:', err);
    }
  };

  return (
    <div className="panel">
      <h2>Set up Your Player</h2>
      {error && <p style={{ color: 'var(--error-color)' }}>{error}</p>}
      <input
        type="text"
        placeholder="Enter your name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleCreatePlayer}>Create Temporary Player</button>
    </div>
  );
}

export default PlayerSetup;
