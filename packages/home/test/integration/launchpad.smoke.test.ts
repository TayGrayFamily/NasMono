import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApiApp, resetDockerSourceCache } from '../../server/apiRouter.js';
import { launchPadAppConfigSchema, launchPadAppsFileSchema } from '../../server/launchpadSchema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../fixtures');
const repoConfigPath = path.resolve(__dirname, '../../config/launchpad.apps.json');

function useFixtureEnv(overridePath?: string) {
  process.env.DOCKER_FIXTURE_PATH = path.join(fixturesDir, 'containers.json');
  process.env.UNRAID_API_KEY = '';
  process.env.UNRAID_GRAPHQL_URL = '';
  process.env.DOCKER_SOCKET_PATH = 'null';
  if (overridePath) {
    process.env.LAUNCHPAD_CONFIG_PATH = overridePath;
  } else {
    delete process.env.LAUNCHPAD_CONFIG_PATH;
  }
  resetDockerSourceCache();
}

describe('LaunchPad API (fixture integration)', () => {
  beforeEach(() => {
    useFixtureEnv();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.LAUNCHPAD_CONFIG_PATH;
    resetDockerSourceCache();
  });

  it('GET /health returns ok', async () => {
    const res = await request(createApiApp()).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /launchpad returns curated apps with Docker status from fixtures', async () => {
    const res = await request(createApiApp()).get('/launchpad');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('apps');
    expect(res.body).toHaveProperty('otherServices');
    expect(Array.isArray(res.body.apps)).toBe(true);
    expect(Array.isArray(res.body.otherServices)).toBe(true);

    const immich = res.body.apps.find((a: { id: string }) => a.id === 'immich');
    expect(immich).toMatchObject({
      displayName: 'Immich',
      state: 'running',
      containerName: 'immich-server',
      hostPort: 2283,
      url: 'http://immich.tower',
    });

    const jellyfin = res.body.apps.find((a: { id: string }) => a.id === 'jellyfin');
    expect(jellyfin).toMatchObject({
      state: 'running',
      containerName: 'jellyfin',
      hostPort: 8096,
    });

    const pihole = res.body.apps.find((a: { id: string }) => a.id === 'pihole');
    expect(pihole).toMatchObject({
      probeUrl: 'http://pihole.tower/api/docs/',
      state: 'running',
      containerName: 'binhex-official-pihole',
    });

    const watchtower = res.body.otherServices.find(
      (c: { name: string }) => c.name === 'watchtower',
    );
    expect(watchtower).toMatchObject({ state: 'running' });

    const matchedIds = new Set(
      res.body.apps.map((a: { containerName?: string }) => a.containerName).filter(Boolean),
    );
    expect(matchedIds.has('watchtower')).toBe(false);
  });

  it('GET /launchpad applies NAS override merge (enabled:false + new app)', async () => {
    useFixtureEnv(path.join(fixturesDir, 'apps.override.json'));
    const res = await request(createApiApp()).get('/launchpad');
    expect(res.status).toBe(200);

    const radarr = res.body.apps.find((a: { id: string }) => a.id === 'radarr');
    expect(radarr).toBeUndefined();

    const smoke = res.body.apps.find((a: { id: string }) => a.id === 'smoke-test-app');
    expect(smoke).toMatchObject({
      displayName: 'Smoke Test Tile',
      url: 'http://smoke-test.tower',
      state: 'unknown',
    });
  });

  it('GET /reachability validates query parameters', async () => {
    const app = createApiApp();

    const missing = await request(app).get('/reachability');
    expect(missing.status).toBe(400);
    expect(missing.body).toMatchObject({ ok: false, error: 'missing target' });

    const invalid = await request(app).get('/reachability').query({ target: 'not-a-url' });
    expect(invalid.status).toBe(400);
    expect(invalid.body).toMatchObject({ ok: false, error: 'invalid url' });

    const scheme = await request(app).get('/reachability').query({ target: 'ftp://example.com' });
    expect(scheme.status).toBe(400);
    expect(scheme.body).toMatchObject({ ok: false, error: 'only http(s) allowed' });
  });

  it('GET /reachability probes HTTP targets (mocked fetch)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 200 })),
    );

    const res = await request(createApiApp())
      .get('/reachability')
      .query({ target: 'http://jellyfin.tower/' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, status: 200, method: 'direct' });
  });
});

describe('LaunchPad bundled config (strict validation)', () => {
  it('launchpad.apps.json entries are all valid', () => {
    const raw = JSON.parse(fs.readFileSync(repoConfigPath, 'utf8'));
    const file = launchPadAppsFileSchema.parse(raw);
    expect(file.length).toBeGreaterThan(0);

    const errors: string[] = [];
    for (const entry of file) {
      const result = launchPadAppConfigSchema.safeParse(entry);
      if (!result.success) {
        errors.push(result.error.message);
      } else {
        try {
          new RegExp(result.data.containerMatch, 'i');
        } catch {
          errors.push(`invalid containerMatch regex for ${result.data.id}`);
        }
      }
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });
});
