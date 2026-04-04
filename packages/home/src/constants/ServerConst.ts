/** Hostname used for service URLs (Tailscale / LAN). Prefer the name you used to open this app. */
export function getLaunchHost(): string {
  if (typeof window !== 'undefined') {
    return window.location.hostname;
  }
  return 'localhost';
}
