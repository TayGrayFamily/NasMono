import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { createApiApp } from '../../server/apiRouter.js';

function clearAdminEnv() {
  delete process.env.ADMIN_ACTIONS_ENABLED;
  delete process.env.STACK_UPDATE_CONTAINER_MATCH;
  delete process.env.UNRAID_API_KEY;
  delete process.env.UNRAID_GRAPHQL_URL;
}

describe('Docker admin actions API', () => {
  beforeEach(() => {
    clearAdminEnv();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    clearAdminEnv();
  });

  it('POST /admin/docker/refresh-digests returns 403 when admin actions disabled', async () => {
    const res = await request(createApiApp()).post('/admin/docker/refresh-digests');
    expect(res.status).toBe(403);
    expect(res.body).toMatchObject({ ok: false, error: 'admin actions disabled' });
  });

  it('POST /admin/docker/containers/:id/update returns 403 when admin actions disabled', async () => {
    const res = await request(createApiApp()).post('/admin/docker/containers/docker%3Aabc/update');
    expect(res.status).toBe(403);
  });

  it('POST /admin/docker/refresh-digests returns 503 when Unraid is not configured', async () => {
    process.env.ADMIN_ACTIONS_ENABLED = 'true';
    const res = await request(createApiApp()).post('/admin/docker/refresh-digests');
    expect(res.status).toBe(503);
    expect(res.body).toMatchObject({ ok: false, error: 'Unraid GraphQL not configured' });
  });

  it('POST /admin/docker/refresh-digests calls Unraid GraphQL when enabled', async () => {
    process.env.ADMIN_ACTIONS_ENABLED = 'true';
    process.env.UNRAID_GRAPHQL_URL = 'http://tower:8080/graphql';
    process.env.UNRAID_API_KEY = 'test-key';

    const fetchMock = vi.fn(async () => Response.json({ data: { refreshDockerDigests: true } }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(createApiApp()).post('/admin/docker/refresh-digests');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.method).toBe('POST');
    const body = JSON.parse(String(init.body)) as { query: string };
    expect(body.query).toContain('refreshDockerDigests');
  });

  it('POST /admin/docker/containers/:id/update runs updateContainer mutation', async () => {
    process.env.ADMIN_ACTIONS_ENABLED = 'true';
    process.env.UNRAID_GRAPHQL_URL = 'http://tower:8080/graphql';
    process.env.UNRAID_API_KEY = 'test-key';

    const fetchMock = vi.fn(async () =>
      Response.json({
        data: {
          docker: {
            updateContainer: {
              id: 'docker:web_app',
              names: ['/web_app'],
              state: 'RUNNING',
              status: 'Up 1 second',
            },
          },
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const res = await request(createApiApp()).post(
      '/admin/docker/containers/docker%3Aweb_app/update',
    );
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.container).toMatchObject({ id: 'docker:web_app', state: 'RUNNING' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { query: string; variables: { id: string } };
    expect(body.query).toContain('updateContainer');
    expect(body.variables.id).toBe('docker:web_app');
  });
});
