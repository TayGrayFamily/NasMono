import type { PublicPortMapping } from './types.js';
import { isLoopbackHostIp } from './loopback.js';

const PREFERRED_CONTAINER_PORTS = new Set([80, 443, 8080, 8443, 3000, 8000]);

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

export function primaryIsLoopbackOnly(primary: PublicPortMapping | null): boolean {
  if (!primary) return false;
  return isLoopbackHostIp(primary.hostIp);
}
