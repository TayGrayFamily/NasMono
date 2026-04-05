import type { PublicPortMapping } from './types.js';
import { isLoopbackHostIp } from './loopback.js';

const PREFERRED_CONTAINER_PORTS = new Set([80, 443, 8080, 8081, 8443, 3000, 8000]);

export function pickPrimaryPort(ports: PublicPortMapping[]): PublicPortMapping | null {
  if (ports.length === 0) return null;
  const tcp = ports.filter((p) => p.protocol.toLowerCase() === 'tcp');
  const pool = tcp.length > 0 ? tcp : ports;

  for (const p of pool) {
    if (PREFERRED_CONTAINER_PORTS.has(p.containerPort)) {
      return p;
    }
  }

  return [...pool].sort((a, b) => a.hostPort - b.hostPort)[0] ?? null;
}

const KNOWN_SERVICE_DEFAULTS: { pattern: RegExp; port: number }[] = [
  { pattern: /jellyfin/i, port: 8096 },
  { pattern: /plex/i, port: 32400 },
  { pattern: /home-assistant/i, port: 8123 },
  { pattern: /scrypted/i, port: 10443 },
];

export function pickPrimaryPortWithDefaults(
  ports: PublicPortMapping[],
  name: string,
  image: string,
): PublicPortMapping | null {
  const primary = pickPrimaryPort(ports);
  if (primary) return primary;

  // If no port mapping is found (typical for host networking),
  // check for known service defaults
  for (const { pattern, port } of KNOWN_SERVICE_DEFAULTS) {
    if (pattern.test(name) || pattern.test(image)) {
      return {
        hostPort: port,
        containerPort: port,
        protocol: 'tcp',
        hostIp: null,
      };
    }
  }

  return null;
}

export function primaryIsLoopbackOnly(primary: PublicPortMapping | null): boolean {
  if (!primary) return false;
  return isLoopbackHostIp(primary.hostIp);
}
