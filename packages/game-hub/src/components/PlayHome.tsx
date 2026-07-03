import React from 'react';
import { useNavigate } from 'react-router-dom';
import { charadesGameMeta } from 'charades';
import './PlayHome.css';

interface PlayHomeProps {
  currentUser: { id: string; name: string } | null;
}

export function PlayHome({ currentUser }: PlayHomeProps) {
  const navigate = useNavigate();

  const handleMultiplayer = () => {
    if (currentUser) {
      navigate('/lobbies');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="play-home">
      <header className="play-home__header">
        <h2 className="play-home__title">Play</h2>
        <p className="play-home__subtitle">
          Solo games on this device, or join a lobby with friends.
        </p>
      </header>

      <section className="play-home__section">
        <h3 className="play-home__section-title">Solo games</h3>
        <div className="play-home__grid">
          <button
            type="button"
            className="play-home__card"
            onClick={() => navigate(charadesGameMeta.path)}
          >
            <span className="play-home__card-icon" aria-hidden="true">
              🎭
            </span>
            <h4 className="play-home__card-title">{charadesGameMeta.name}</h4>
            <p className="play-home__card-desc">{charadesGameMeta.description}</p>
            <span className="play-home__card-badge">Pass and play</span>
          </button>
        </div>
      </section>

      <section className="play-home__section">
        <h3 className="play-home__section-title">Multiplayer</h3>
        <button type="button" className="play-home__multiplayer-btn" onClick={handleMultiplayer}>
          {currentUser ? 'Go to lobbies' : 'Sign in for lobbies'}
        </button>
        {currentUser && (
          <p className="play-home__signed-in">
            Signed in as <strong>{currentUser.name}</strong>
          </p>
        )}
      </section>
    </div>
  );
}
