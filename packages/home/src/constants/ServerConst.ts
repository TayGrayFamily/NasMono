function normalizeLaunchProtocol(raw: string | undefined): string | null {
  const p = raw?.trim().toLowerCase();
  if (!p) return null;
  if (p === 'http' || p === 'https') return `${p}:`;
  if (p === 'http:' || p === 'https:') return p;
  return null;
}

/**
 * Protocol for deep links and service probes (Immich, Jellyfin, …).
 * Override when the UI is served from `localhost` but services use another scheme (e.g. always `http` on the NAS).
 */
export function getLaunchProtocol(): string {
  const fromEnv = normalizeLaunchProtocol(import.meta.env.VITE_LAUNCH_PROTOCOL);
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') {
    return window.location.protocol;
  }
  return 'http:';
}

/**
 * Hostname for service URLs. Defaults to `window.location.hostname` so opening the app as
 * `http://tower:8888` uses `tower` for `:9001`, etc.
 * When developing with Vite on `localhost`, set `VITE_LAUNCH_HOST=tower` (Tailscale / LAN name).
 */
export function getLaunchHost(): string {
  const fromEnv = import.meta.env.VITE_LAUNCH_HOST?.trim();
  if (fromEnv) return fromEnv;
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
}
