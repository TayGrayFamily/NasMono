import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Status variables
let dbStatus = 'Not Initialized';
let dbConnectionError: string | null = null;

let pool: Pool | null = null;

function isValidConnectionString(connString: string | undefined): boolean {
  if (!connString) return false;
  return connString.startsWith('postgres://') || connString.startsWith('postgresql://');
}

const connectionString = process.env.DATABASE_URL;

if (isValidConnectionString(connectionString)) {
  console.log('--- DATABASE CONFIGURATION ---');
  // Masking password in logs
  const maskedConnectionString = connectionString!.replace(/:[^@]+@/, ':****@');
  console.log(`Connecting to: ${maskedConnectionString}`);
  try {
    const poolConfig: PoolConfig = { connectionString };
    pool = new Pool(poolConfig);
    dbStatus = 'Initialized';
  } catch (error: unknown) {
    dbConnectionError = `Failed to create pool: ${error instanceof Error ? error.message : String(error)}`;
    console.error(dbConnectionError);
    dbStatus = 'Error';
  }
} else {
  console.warn('--- DATABASE WARNING ---');
  console.warn('DATABASE_URL is not set or invalid in .env!');
  console.warn('The application will run without persistence.');
  dbConnectionError = 'DATABASE_URL not configured correctly.';
  dbStatus = 'Not Available';
}

async function setupDatabase() {
  if (!pool) {
    console.warn('Skipping database schema setup: Pool not available.');
    return;
  }

  try {
    const client = await pool.connect();
    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
                is_temporary BOOLEAN NOT NULL DEFAULT true,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS lobbies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS lobby_players (
                lobby_id UUID REFERENCES lobbies(id) ON DELETE CASCADE,
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (lobby_id, user_id)
            );
        `);
    dbStatus = 'Schema OK';
    client.release();
    console.log('Database schema setup complete.');
  } catch (err: unknown) {
    const details = err instanceof Error ? err.message : String(err);
    dbConnectionError = `Database setup failed: ${details}`;
    dbStatus = 'Schema Error';
    console.error('Detailed DB error:', err);
  }
}

async function getDbClient() {
  if (!pool) throw new Error('Database connection pool is not available.');
  try {
    return await pool.connect();
  } catch (err: unknown) {
    dbConnectionError = `Connection failed: ${err instanceof Error ? err.message : String(err)}`;
    console.error(dbConnectionError);
    dbStatus = 'Connection Error';
    throw err;
  }
}

// New functions for user management
export async function findUserByName(
  name: string,
): Promise<{ id: string; name: string; created_at: Date } | null> {
  if (!pool) throw new Error('Database connection pool is not available.');
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, name, created_at FROM users WHERE name = $1', [
      name,
    ]);
    return result.rows[0] || null;
  } finally {
    client.release();
  }
}

export async function createUser(
  name: string,
): Promise<{ id: string; name: string; created_at: Date }> {
  if (!pool) throw new Error('Database connection pool is not available.');
  const client = await pool.connect();
  try {
    const result = await client.query(
      'INSERT INTO users (name, is_temporary) VALUES ($1, true) RETURNING id, name, created_at',
      [name],
    );
    return result.rows[0];
  } finally {
    client.release();
  }
}

export async function findOrCreateUser(
  name: string,
): Promise<{ id: string; name: string; created_at: Date }> {
  const existingUser = await findUserByName(name);
  if (existingUser) {
    console.log(`User found: ${name} (ID: ${existingUser.id})`);
    return existingUser;
  } else {
    console.log(`User not found, creating: ${name}`);
    return await createUser(name);
  }
}

// Initialize
setupDatabase();

// Update exports to include new functions
export {
  setupDatabase,
  getDbClient,
  pool,
  dbStatus,
  dbConnectionError,
  findUserByName,
  createUser,
  findOrCreateUser,
};
