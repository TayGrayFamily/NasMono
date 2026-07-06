import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { GameToolbar } from './GameToolbar.js';

export type GameToolbarState = {
  title: string;
  subtitle?: string;
};

export interface EmbeddedGameShellProps {
  children: ReactNode;
  defaultTitle: string;
  onExit: () => void;
  exitLabel?: string;
}

type GameToolbarApi = {
  setToolbar: (state: GameToolbarState) => void;
};

const GameToolbarContext = createContext<GameToolbarApi | null>(null);

/** Let embedded game screens set toolbar title/subtitle without owning the shell chrome. */
export function useGameToolbar(title: string, subtitle?: string) {
  const api = useContext(GameToolbarContext);

  useEffect(() => {
    if (!api) return;
    api.setToolbar({ title, subtitle });
  }, [api, title, subtitle]);
}

export function EmbeddedGameShell({
  children,
  defaultTitle,
  onExit,
  exitLabel,
}: EmbeddedGameShellProps) {
  const [toolbar, setToolbar] = useState<GameToolbarState>({ title: defaultTitle });
  const api = useMemo<GameToolbarApi>(() => ({ setToolbar }), []);

  return (
    <GameToolbarContext.Provider value={api}>
      <div className="embedded-game">
        <GameToolbar
          title={toolbar.title}
          subtitle={toolbar.subtitle}
          onExit={onExit}
          exitLabel={exitLabel}
        />
        <div className="embedded-game__content">{children}</div>
      </div>
    </GameToolbarContext.Provider>
  );
}
