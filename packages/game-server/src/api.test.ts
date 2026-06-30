import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../index.js';
import * as db from './db/index.js';
import { LobbyService } from './services/LobbyService.js';

vi.mock('./db/index.js');
vi.mock('./services/LobbyService.js');

describe('API Integration Tests', () => {
  let app: any;
  let httpServer: any;

  beforeAll(async () => {
    const created = await createApp();
    app = created.app;
    httpServer = created.httpServer;
  });

  afterAll(() => {
    httpServer.close();
  });

  describe('GET /api/health', () => {
    it('returns ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expect.objectContaining({ ok: true }));
    });
  });

  describe('GET /debug', () => {
    it('returns 404 when admin is disabled', async () => {
      const res = await request(app).get('/debug');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/login', () => {
    it('should create or find a user successfully', async () => {
      vi.spyOn(db, 'findOrCreateUser').mockResolvedValue({
        id: 'test-user-id',
        name: 'TestUser',
        createdAt: new Date(),
      });

      const res = await request(app).post('/api/login').send({ name: 'TestUser' });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', 'test-user-id');
    });
  });

  describe('GET /api/lobbies', () => {
    it('should fetch list of lobbies', async () => {
      vi.spyOn(LobbyService.prototype, 'getAllLobbies').mockResolvedValue([
        { id: '1', name: 'Test Lobby', playercount: 1 },
      ]);

      const res = await request(app).get('/api/lobbies');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].name).toBe('Test Lobby');
    });
  });

  describe('POST /api/lobbies', () => {
    it('rejects lobby creation without socket identification', async () => {
      const res = await request(app).post('/api/lobbies').send({ name: 'Test', userId: 'u1' });
      expect(res.status).toBe(401);
    });
  });
});
