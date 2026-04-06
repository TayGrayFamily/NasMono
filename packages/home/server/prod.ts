import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApiApp } from './apiRouter.js';
import dotenv from 'dotenv';

// Fix: Define __dirname properly before using it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const distDir = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.HOME_BACKEND_PORT || process.env.HOME_PORT || 80);
const host = process.env.HOST ?? '0.0.0.0';

const app = express();
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

app.listen(port, host, () => {
  console.log(`nasmono-home listening on http://${host}:${port}`);
});
