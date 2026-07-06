import './GameToolbar.css';

export interface GameToolbarProps {
  title: string;
  subtitle?: string;
  onExit: () => void;
  exitLabel?: string;
}

export function GameToolbar({ title, subtitle, onExit, exitLabel = 'Exit' }: GameToolbarProps) {
  return (
    <header className="game-toolbar" aria-label={`${title} game`}>
      <button type="button" className="game-toolbar__exit" onClick={onExit}>
        {exitLabel}
      </button>
      <div className="game-toolbar__heading">
        <h1 className="game-toolbar__title">{title}</h1>
        {subtitle ? <p className="game-toolbar__subtitle">{subtitle}</p> : null}
      </div>
    </header>
  );
}
