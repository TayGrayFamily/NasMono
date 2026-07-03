import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApiApp } from '../../server/apiRouter.js';
import { generateCaddyfile, generateDnsFile } from '../../server/domainRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../fixtures');
const outDir = path.join(fixturesDir, 'out');
const sourceConfig = path.join(fixturesDir, 'domains.routes.json');

function useDomainsFixtureEnv() {
  fs.mkdirSync(outDir, { recursive: true });
  fs.copyFileSync(sourceConfig, path.join(outDir, 'domains.json'));

  process.env.DOMAINS_CONFIG_FIXTURE_PATH = path.join(outDir, 'domains.json');
  process.env.CADDYFILE_FIXTURE_PATH = path.join(outDir, 'Caddyfile');
  process.env.PIHOLE_DNS_FIXTURE_PATH = path.join(outDir, 'domains.dns');
  process.env.CADDY_RESTART_FIXTURE = 'ok';
  process.env.DOCKER_FIXTURE_PATH = path.join(fixturesDir, 'containers.json');
  process.env.UNRAID_API_KEY = '';
  process.env.UNRAID_GRAPHQL_URL = '';
  process.env.DOCKER_SOCKET_PATH = 'null';
}

function cleanupOutDir() {
  for (const file of ['domains.json', 'Caddyfile', 'domains.dns']) {
    const p = path.join(outDir, file);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
}

describe('Domains API (fixture integration)', () => {
  beforeEach(() => {
    useDomainsFixtureEnv();
  });

  afterEach(() => {
    cleanupOutDir();
    delete process.env.DOMAINS_CONFIG_FIXTURE_PATH;
    delete process.env.CADDYFILE_FIXTURE_PATH;
    delete process.env.PIHOLE_DNS_FIXTURE_PATH;
    delete process.env.CADDY_RESTART_FIXTURE;
  });

  it('GET /admin/domains returns fixture config', async () => {
    const res = await request(createApiApp()).get('/admin/domains');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      upstreamHost: '192.168.1.50',
    });
    expect(res.body.routes).toEqual(
      expect.arrayContaining([{ hostname: 'home.tower', port: 8888 }]),
    );
  });

  it('PUT /admin/domains writes Caddyfile, DNS, and restarts Caddy (mocked)', async () => {
    const updated = {
      upstreamHost: '192.168.1.99',
      routes: [
        { hostname: 'home.tower', port: 8888 },
        { hostname: 'demo.tower', port: 3000 },
      ],
    };

    const res = await request(createApiApp())
      .put('/admin/domains')
      .send(updated)
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, caddyRestarted: true });

    const caddyPath = path.join(outDir, 'Caddyfile');
    const dnsPath = path.join(outDir, 'domains.dns');
    const configPath = path.join(outDir, 'domains.json');

    expect(fs.readFileSync(caddyPath, 'utf8')).toBe(generateCaddyfile(updated));
    expect(fs.readFileSync(dnsPath, 'utf8')).toBe(generateDnsFile(updated));
    expect(JSON.parse(fs.readFileSync(configPath, 'utf8'))).toEqual(updated);

    const getRes = await request(createApiApp()).get('/admin/domains');
    expect(getRes.body).toEqual(updated);
  });

  it('PUT /admin/domains rejects invalid config', async () => {
    const res = await request(createApiApp())
      .put('/admin/domains')
      .send({ upstreamHost: 'not-an-ip', routes: [] })
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ ok: false });
  });

  it('PUT /admin/domains surfaces restart failure from fixture', async () => {
    process.env.CADDY_RESTART_FIXTURE = 'fail';

    const res = await request(createApiApp())
      .put('/admin/domains')
      .send(JSON.parse(fs.readFileSync(sourceConfig, 'utf8')))
      .set('Content-Type', 'application/json');

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      ok: false,
      error: expect.stringMatching(/restart failed/i),
    });
  });
});
