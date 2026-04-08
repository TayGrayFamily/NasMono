import { Pool, type PoolConfig } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../schema.js';
import { eq } from 'drizzle-orm';
import { users } from '../schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Status variables
let dbStatus = 'Not Initialized';
let dbConnectionError: string | null = null;

let pool: Pool | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

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
    db = drizzle(pool, { schema });
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
    const dropTablesOnStart = process.env.GAME_SERVER_DROP_TABLES_ON_START === 'true';

    if (dropTablesOnStart) {
      console.log('GAME_SERVER_DROP_TABLES_ON_START is true. Dropping tables...');
      await client.query(`
            DROP TABLE IF EXISTS lobby_players;
            DROP TABLE IF EXISTS lobbies;
            DROP TABLE IF EXISTS users;
        `);
    }

    await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL UNIQUE,
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

async function findUserByName(name: string) {
  if (!db) throw new Error('Database connection is not available.');
  const result = await db.select().from(users).where(eq(users.name, name));
  return result[0] || null;
}

async function createUser(name: string) {
  if (!db) throw new Error('Database connection is not available.');
  const result = await db.insert(users).values({ name }).returning();
  return result[0];
}

async function findOrCreateUser(name: string) {
  const existingUser = await findUserByName(name);
  if (existingUser) {
    console.log(`User found: ${name} (ID: ${existingUser.id})`);
    return existingUser;
  } else {
    console.log(`User not found, creating: ${name}`);
    return await createUser(name);
  }
}

export { setupDatabase, getDbClient, pool, db, dbStatus, dbConnectionError, findOrCreateUser };
