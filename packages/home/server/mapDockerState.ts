import type { ContainerDaemonState } from './types.js';

export function mapDockerodeState(state: string): ContainerDaemonState {
  const s = state.toLowerCase();
  if (
    s === 'running' ||
    s === 'paused' ||
    s === 'exited' ||
    s === 'created' ||
    s === 'restarting' ||
    s === 'removing' ||
    s === 'dead'
  ) {
    return s;
  }
  return 'unknown';
}

export function mapUnraidState(state: string): ContainerDaemonState {
  switch (state) {
    case 'RUNNING':
      return 'running';
    case 'PAUSED':
      return 'paused';
    case 'EXITED':
      return 'exited';
    default:
      return 'unknown';
  }
}
