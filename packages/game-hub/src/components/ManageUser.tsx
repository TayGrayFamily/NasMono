import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from './ui/LoadingButton';

interface User {
  id: string;
  name: string;
}

interface ManageUserProps {
  currentUser: User;
  onUserUpdated: (user: User) => void;
}

function ManageUser({ currentUser, onUserUpdated }: ManageUserProps) {
  const [newName, setNewName] = useState(currentUser.name);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleUpdate = async () => {
    if (!newName.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError(null);
    setSuccess(false);
    setIsUpdating(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error((await response.text()) || 'Failed to update user');
      }

      const updatedUser: User = await response.json();
      onUserUpdated(updatedUser);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="panel"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <header>
        <button
          className="ghost"
          onClick={() => navigate(-1)}
          style={{ marginLeft: '-0.5rem', marginBottom: '0.5rem' }}
        >
          ← Back
        </button>
        <h2>Manage Profile</h2>
        <p className="text-muted">Update your display name and account details.</p>
      </header>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Player ID
          </label>
          <code
            style={{
              padding: '0.75rem',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
            }}
          >
            {currentUser.id}
          </code>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label
            htmlFor="editName"
            style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}
          >
            Display Name
          </label>
          <input
            id="editName"
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {error && (
          <div
            style={{
              color: 'var(--error-color)',
              fontSize: '0.875rem',
              padding: '0.75rem',
              background: 'rgba(244, 63, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--error-color)',
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              color: 'var(--primary-green)',
              fontSize: '0.875rem',
              padding: '0.75rem',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--primary-green)',
            }}
          >
            Profile updated successfully!
          </div>
        )}

        <LoadingButton onClick={handleUpdate} isLoading={isUpdating} style={{ width: '100%' }}>
          Save Changes
        </LoadingButton>
      </section>
    </div>
  );
}

export default ManageUser;
