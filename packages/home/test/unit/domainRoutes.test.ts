import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  generateCaddyfile,
  generateDnsEntries,
  parseCaddyfileRoutes,
} from '../../server/domainRoutes.js';
import { parseDomainsConfig } from '../../server/domainRoutesSchema.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '../fixtures');

describe('domainRoutes (P1 editor model)', () => {
  const config = parseDomainsConfig(
    JSON.parse(readFileSync(join(fixturesDir, 'domains.routes.json'), 'utf8')),
    'fixture',
  )!;

  it('generates Caddyfile with shared upstream IP and per-host ports', () => {
    const caddyfile = generateCaddyfile(config);

    expect(caddyfile).toContain('reverse_proxy 192.168.1.50:8888');
    expect(caddyfile).toContain('http://home.tower {');
    expect(caddyfile).toContain('http://jellyfin.tower {');
    expect(caddyfile).toContain('reverse_proxy 192.168.1.50:8096');
  });

  it('round-trips generated Caddyfile back to routes', () => {
    const caddyfile = generateCaddyfile(config);
    const parsed = parseCaddyfileRoutes(caddyfile);

    expect(parsed).toEqual({
      upstreamHost: config.upstreamHost,
      routes: [...config.routes].sort((a, b) => a.hostname.localeCompare(b.hostname)),
    });
  });

  it('generates Pi-hole-style DNS lines with the same upstream IP', () => {
    const dns = generateDnsEntries(config);
    const expected = readFileSync(join(fixturesDir, 'domains.dns'), 'utf8').trim().split('\n');

    expect(dns).toEqual(expected);
  });
});
