export type ReachabilityResult = {
  ok: boolean;
  status: number;
  /** Machine-readable reason when ok is false */
  error?: string;
  /** Human-readable detail for debugging */
  detail?: string;
  /** How the probe succeeded or last attempt made */
  method?: 'direct' | 'gateway' | 'host_port';
};

function classifyFetchError(err: unknown, hostname: string): { error: string; detail: string } {
  if (err instanceof Error) {
    if (err.name === 'AbortError') {
      return { error: 'timeout', detail: 'Timed out after 8s' };
    }
    const nested = err.cause;
    const code =
      (nested instanceof Error && 'code' in nested
        ? (nested as NodeJS.ErrnoException).code
        : undefined) ?? ('code' in err ? (err as NodeJS.ErrnoException).code : undefined);
    if (code === 'ENOTFOUND') {
      return { error: 'dns', detail: `Could not resolve ${hostname}` };
    }
    if (code === 'ECONNREFUSED') {
      return { error: 'connection_refused', detail: `Connection refused (${hostname})` };
    }
    if (code === 'ECONNRESET') {
      return { error: 'connection_reset', detail: 'Connection reset by peer' };
    }
    if (code === 'CERT_HAS_EXPIRED' || code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
      return { error: 'tls', detail: `TLS error: ${code}` };
    }
    return { error: 'fetch_failed', detail: err.message };
  }
  return { error: 'fetch_failed', detail: String(err) };
}

async function fetchProbe(
  url: string,
  headers: Record<string, string>,
  signal: AbortSignal,
): Promise<{ ok: boolean; status: number }> {
  const resp = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
    signal,
    headers: { 'User-Agent': 'NasMono-Reachability/1.0', ...headers },
  });
  const status = resp.status;
  const ok = status > 0 && status < 500;
  return { ok, status };
}

function gatewayBase(): string | null {
  const raw = process.env.REACHABILITY_GATEWAY?.trim();
  return raw || null;
}

function buildGatewayUrl(gateway: string, target: URL): string {
  const base = new URL(gateway);
  return `${base.origin}${target.pathname}${target.search}`;
}

function buildHostPortUrl(gateway: string, hostPort: number): string {
  const base = new URL(gateway.includes('://') ? gateway : `http://${gateway}`);
  base.pathname = '/';
  base.search = '';
  base.port = String(hostPort);
  return base.href;
}

export async function probeReachability(
  target: URL,
  hostPort?: number,
): Promise<ReachabilityResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    try {
      const { ok, status } = await fetchProbe(target.href, {}, controller.signal);
      return { ok, status, method: 'direct' };
    } catch (directErr) {
      const gateway = gatewayBase();
      if (!gateway) {
        const { error, detail } = classifyFetchError(directErr, target.hostname);
        return {
          ok: false,
          status: 0,
          error,
          detail: `${detail} (set REACHABILITY_GATEWAY for Docker/reverse-proxy setups)`,
          method: 'direct',
        };
      }

      try {
        const gatewayUrl = buildGatewayUrl(gateway, target);
        const { ok, status } = await fetchProbe(
          gatewayUrl,
          { Host: target.host },
          controller.signal,
        );
        return {
          ok,
          status,
          method: 'gateway',
          detail: ok ? undefined : `HTTP ${status} via host gateway`,
        };
      } catch (gatewayErr) {
        if (hostPort != null && hostPort > 0) {
          try {
            const portUrl = buildHostPortUrl(gateway, hostPort);
            const { ok, status } = await fetchProbe(portUrl, {}, controller.signal);
            return {
              ok,
              status,
              method: 'host_port',
              detail: ok
                ? `HTTP ${status} on host port ${hostPort}`
                : `HTTP ${status} on port ${hostPort}`,
            };
          } catch (portErr) {
            const { error, detail } = classifyFetchError(portErr, target.hostname);
            const gwDetail = classifyFetchError(gatewayErr, target.hostname).detail;
            return {
              ok: false,
              status: 0,
              error,
              detail: `${detail}. Gateway Host:${target.host} failed (${gwDetail})`,
              method: 'host_port',
            };
          }
        }

        const { error, detail } = classifyFetchError(gatewayErr, target.hostname);
        const directDetail = classifyFetchError(directErr, target.hostname).detail;
        return {
          ok: false,
          status: 0,
          error,
          detail: `${detail}. Direct: ${directDetail}`,
          method: 'gateway',
        };
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}
