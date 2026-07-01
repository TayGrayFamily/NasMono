import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  compareCaddyLaunchpadDrift,
  extractCaddyfileHostnames,
} from '../../server/caddyfileHosts.js';
import { parseLaunchPadApps } from '../../server/launchpadSchema.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '../fixtures');

describe('caddyfileHosts (P0 spike)', () => {
  it('extracts hostnames from fixture Caddyfile', () => {
    const caddyfile = readFileSync(join(fixturesDir, 'Caddyfile'), 'utf8');
    const hosts = extractCaddyfileHostnames(caddyfile);

    expect(hosts).toEqual([
      'frame.tower',
      'games.tower',
      'home.tower',
      'immich.tower',
      'jellyfin.tower',
      'pihole.tower',
      'radarr.tower',
      'sonarr.tower',
      'torrent.tower',
      'unraid.tower',
    ]);
  });

  it('matches documented drift snapshot vs launchpad.apps.json', () => {
    const caddyfile = readFileSync(join(fixturesDir, 'Caddyfile'), 'utf8');
    const driftDoc = JSON.parse(
      readFileSync(join(fixturesDir, 'caddy.launchpad-drift.json'), 'utf8'),
    ) as {
      inBoth: string[];
      caddyOnly: string[];
      launchpadOnly: string[];
    };

    const launchpadRaw = JSON.parse(
      readFileSync(join(here, '../../config/launchpad.apps.json'), 'utf8'),
    );
    const apps = parseLaunchPadApps(launchpadRaw, 'test');
    const urls = apps.map((a) => a.url);

    const drift = compareCaddyLaunchpadDrift(extractCaddyfileHostnames(caddyfile), urls);

    expect(drift.inBoth).toEqual(driftDoc.inBoth);
    expect(drift.caddyOnly).toEqual(driftDoc.caddyOnly);
    expect(drift.launchpadOnly).toEqual(driftDoc.launchpadOnly);
  });
});
