import express from 'express';
import { UserService } from '../services/UserService.js';

export function createUserRouter(userService: UserService) {
  const router = express.Router();

  router.post('/login', async (req, res) => {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Username is required' });
    }

    try {
      const user = await userService.login(name);
      console.log(`User logged in: ${user.name} (ID: ${user.id})`);
      res.status(200).json(user);
    } catch (err: unknown) {
      console.error('Login/create user failed:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  router.patch('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const user = await userService.updateUser(id, name);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      console.log(`User updated: ${user.name} (ID: ${id})`);
      res.json(user);
    } catch (err: unknown) {
      console.error('Update user failed:', err);
      const pgErr = err as any;
      if (pgErr.code === '23505') {
        return res.status(409).json({ error: 'Username is already taken' });
      }
      res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
    }
  });

  return router;
}
