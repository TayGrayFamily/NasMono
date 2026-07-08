import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './apiRouter.js';
import dotenv from 'dotenv';

// Optional env vars — warn when missing but app still starts with limited features.
const optionalEnvVars = ['UNRAID_API_KEY', 'UNRAID_GRAPHQL_URL'];

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const missingVars = optionalEnvVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn('--- CONFIGURATION WARNING ---');
  console.warn(`The following environment variables are missing: ${missingVars.join(', ')}`);
  console.warn('Docker container status will be unavailable until Unraid GraphQL is configured.');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '..', 'dist');

// Use environment variables with safe fallbacks
const port = Number(process.env.PORT || 8888);
const host = process.env.SERVER_HOST || '0.0.0.0';

const app = express();

// Helper to log all incoming requests for debugging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api', createApiApp());
app.use(express.static(distDir));

app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    next();
    return;
  }
  if (req.path.startsWith('/api')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.sendFile(path.join(distDir, 'index.html'), (err) => {
    if (err) next(err);
  });
});

// 2. Resilience: Handle server startup errors
const server = app.listen(port, host, () => {
  console.log(`nasmono-home listening on http://${host}:${port}`);
});

server.on('error', (e: any) => {
  if (e.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
  } else {
    console.error('Server startup error:', e);
  }
  process.exit(1);
});
