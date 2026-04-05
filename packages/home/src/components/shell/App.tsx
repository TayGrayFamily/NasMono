import type { JSX } from 'react';
import { Toolbar } from './Toolbar';
import { LaunchPad } from '../lauchpad/LaunchPad';
import './Shell.css';

export function App(): JSX.Element {
  return (
    <div className="shell-container">
      <Toolbar />
      <main style={{ flex: 1 }}>
        <LaunchPad />
      </main>
    </div>
  );
}
