/**
 * Minimal Caddyfile hostname extraction for Domains drift checks (P0 spike).
 * Not a full Caddyfile parser — sufficient for site-block addresses in homelab configs.
 */

const HOST_IN_LINE_RE = /(?:https?:\/\/)?([a-z0-9][-a-z0-9.]*\.[a-z0-9][-a-z0-9.]*)/gi;

/** Extract hostnames from site-block address lines (e.g. `http://jellyfin.tower {`). */
export function extractCaddyfileHostnames(caddyfile: string): string[] {
  const hosts = new Set<string>();

  for (const line of caddyfile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (!trimmed.includes('{')) continue;

    const beforeBrace = trimmed.slice(0, trimmed.indexOf('{')).trim();
    if (!beforeBrace || beforeBrace.startsWith('{')) continue;

    for (const match of beforeBrace.matchAll(HOST_IN_LINE_RE)) {
      const host = match[1]?.toLowerCase();
      if (host) hosts.add(host);
    }
  }

  return [...hosts].sort();
}

export function hostnameFromUrl(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export type CaddyLaunchpadDrift = {
  inBoth: string[];
  caddyOnly: string[];
  launchpadOnly: string[];
};

/** Compare Caddyfile hostnames to LaunchPad tile URLs (hostname only). */
export function compareCaddyLaunchpadDrift(
  caddyHosts: string[],
  launchpadUrls: string[],
): CaddyLaunchpadDrift {
  const caddy = new Set(caddyHosts.map((h) => h.toLowerCase()));
  const launchpad = new Set(
    launchpadUrls.map(hostnameFromUrl).filter((h): h is string => h != null),
  );

  const inBoth: string[] = [];
  const caddyOnly: string[] = [];
  const launchpadOnly: string[] = [];

  for (const host of [...caddy].sort()) {
    if (launchpad.has(host)) inBoth.push(host);
    else caddyOnly.push(host);
  }

  for (const host of [...launchpad].sort()) {
    if (!caddy.has(host)) launchpadOnly.push(host);
  }

  return { inBoth, caddyOnly, launchpadOnly };
}
