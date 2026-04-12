import { getDbClient, findOrCreateUser } from '../db/index.js';

export class UserService {
  async login(name: string) {
    return await findOrCreateUser(name);
  }

  async updateUser(id: string, name: string) {
    const client = await getDbClient();
    try {
      const result = await client.query(
        'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name',
        [name, id],
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string) {
    const client = await getDbClient();
    try {
      const result = await client.query('SELECT id, name FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getAllUsers() {
    const client = await getDbClient();
    try {
      const result = await client.query('SELECT * FROM users');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async deleteUser(id: string) {
    const client = await getDbClient();
    try {
      await client.query('DELETE FROM users WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }
}
