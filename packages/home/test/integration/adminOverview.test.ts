import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApiApp } from '../../server/apiRouter.js';

const overviewPayload = {
  info: {
    os: { hostname: 'tower', distro: 'Unraid', release: '7.0', uptime: '1 day' },
    cpu: { brand: 'Intel', cores: 4, threads: 8 },
    versions: { core: { unraid: '7.0.0', api: '4.0.0' } },
    baseboard: { memMax: 64_000_000_000, memSlots: 4 },
    memory: { layout: [{ bank: 'BANK 0', size: 16_000_000_000, type: 'DDR4', clockSpeed: 3200 }] },
    display: { warning: 55, critical: 65 },
  },
  metrics: {
    cpu: { percentTotal: 10 },
    memory: {
      total: 16_000_000_000,
      used: 8_000_000_000,
      free: 4_000_000_000,
      available: 6_000_000_000,
      active: 5_000_000_000,
      buffcache: 2_000_000_000,
      percentTotal: 50,
    },
  },
  array: {
    state: 'STARTED',
    parityCheckStatus: { status: 'none', progress: 0 },
    boot: {
      name: 'flash',
      device: 'sda',
      type: 'FLASH',
      status: 'OK',
      temp: 30,
      fsSize: 32_000_000,
      fsFree: 16_000_000,
      fsUsed: 16_000_000,
    },
    parities: [],
    disks: [],
    caches: [],
  },
  disks: [],
  docker: {
    containers: [
      {
        id: 'docker:web_app',
        names: ['/web_app'],
        image: 'ghcr.io/taygrayfamily/nasmono-home:latest',
        state: 'RUNNING',
        status: 'Up 1 hour',
        autoStart: true,
      },
    ],
  },
  shares: [],
  services: [],
  notifications: {
    overview: { unread: { total: 0 }, archive: { total: 0 } },
    list: [],
  },
};

describe('GET /admin/overview', () => {
  beforeEach(() => {
    process.env.UNRAID_GRAPHQL_URL = 'http://tower:8080/graphql';
    process.env.UNRAID_API_KEY = 'test-key';
    delete process.env.ADMIN_ACTIONS_ENABLED;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.UNRAID_GRAPHQL_URL;
    delete process.env.UNRAID_API_KEY;
  });

  it('returns overview when isUpdateAvailable query is unsupported', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { query: string };
      if (body.query.includes('isUpdateAvailable')) {
        return Response.json({
          errors: [{ message: 'Cannot query field "isUpdateAvailable"' }],
          data: null,
        });
      }
      return Response.json({ data: overviewPayload });
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(createApiApp()).get('/admin/overview');
    expect(res.status).toBe(200);
    expect(res.body.containers.items[0]).toMatchObject({
      id: 'docker:web_app',
      name: 'web_app',
      image: 'ghcr.io/taygrayfamily/nasmono-home:latest',
      updateAvailable: false,
    });
    expect(res.body.warnings.some((w: string) => w.includes('update flags unavailable'))).toBe(
      true,
    );
    const queries = fetchMock.mock.calls.map(
      ([, init]) => JSON.parse(String((init as RequestInit)?.body)).query as string,
    );
    expect(queries.some((q) => q.includes('AdminOverview'))).toBe(true);
    expect(queries.some((q) => q.includes('isUpdateAvailable'))).toBe(true);
  });
});
