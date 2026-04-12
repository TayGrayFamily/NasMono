import express from 'express';
import { setupDatabase, getDbClient } from '../db/index.js';

export function createAdminRouter() {
  const router = express.Router();

  router.post('/actions/sync-db', async (req, res) => {
    try {
      await setupDatabase();
      res.json({ message: 'Database schema synchronized.' });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.post('/actions/clean-lobbies', async (req, res) => {
    try {
      const client = await getDbClient();
      const result = await client.query(`
        DELETE FROM lobbies 
        WHERE id NOT IN (SELECT DISTINCT lobby_id FROM lobby_players)
      `);
      client.release();
      res.json({ message: `Cleaned up ${result.rowCount} empty lobbies.` });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.post('/actions/wipe-lobbies', async (req, res) => {
    try {
      const client = await getDbClient();
      await client.query('DELETE FROM lobbies');
      client.release();
      res.json({ message: 'All lobbies wiped.' });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.delete('/lobbies/:id', async (req, res) => {
    try {
      const client = await getDbClient();
      await client.query('DELETE FROM lobbies WHERE id = $1', [req.params.id]);
      client.release();
      res.json({ message: 'Lobby deleted.' });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  router.delete('/users/:id', async (req, res) => {
    try {
      const client = await getDbClient();
      await client.query('DELETE FROM users WHERE id = $1', [req.params.id]);
      client.release();
      res.json({ message: 'User deleted.' });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });

  return router;
}
