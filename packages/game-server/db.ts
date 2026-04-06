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

const connectionString = process.env.DATABASE_URL;

if (connectionString && connectionString.startsWith('postgres')) {
  console.log('--- DATABASE CONFIGURATION ---');
  console.log(`Connecting to: ${connectionString.replace(/:[^@]+@/, ':****@')}`);
  try {
    const poolConfig: PoolConfig = { connectionString };
    pool = new Pool(poolConfig);
    dbStatus = 'Initialized';
  } catch (error: any) {
    dbConnectionError = `Failed to create pool: ${error.message}`;
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
                name VARCHAR(255) NOT NULL,
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
  } catch (err: any) {
    const details = err.errors ? err.errors.map((e: any) => e.message).join(', ') : err.message;
    dbConnectionError = `Database setup failed: ${details}`;
    dbStatus = 'Schema Error';
    console.error('Detailed DB error:', err);
  }
}

async function getDbClient() {
  if (!pool) throw new Error('Database connection pool is not available.');
  try {
    return await pool.connect();
  } catch (err: any) {
    dbConnectionError = `Connection failed: ${err.message}`;
    console.error(dbConnectionError);
    dbStatus = 'Connection Error';
    throw err;
  }
}

// Initialize
setupDatabase();

export { setupDatabase, getDbClient, pool, dbStatus, dbConnectionError };
